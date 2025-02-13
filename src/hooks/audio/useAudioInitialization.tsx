
import { useRef, useEffect } from "react";
import { Song } from "@/types/song";

interface UseAudioInitializationProps {
  song: Song;
  setVolumes: (value: React.SetStateAction<{ [key: string]: number }>) => void;
  setMutedTracks: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
  setDuration: (value: number) => void;
  handleTimeUpdate: (event: Event) => void;
  handleTrackEnd: () => void;
}

export const useAudioInitialization = ({
  song,
  setVolumes,
  setMutedTracks,
  setDuration,
  handleTimeUpdate,
  handleTrackEnd,
}: UseAudioInitializationProps) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const loadingPromises = useRef<{ [key: string]: Promise<void> }>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const loadTrack = async (track: { id: string; url: string }) => {
    if (loadingPromises.current[track.id]) {
      return loadingPromises.current[track.id];
    }

    const loadingPromise = new Promise<void>((resolve) => {
      const audio = new Audio();
      
      // iOS/Safari-specifika optimeringar
      audio.preload = "auto";
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      
      // Tvinga Safari att preload hela filen
      if ('mediaGroup' in audio) {
        audio.mediaGroup = 'audiogroup'; // Gruppera ljudfiler för bättre buffringshantering
      }
      
      // Försök sätta buffer mode för mer aggressiv buffring
      if ('mozAutoplayEnabled' in audio) {
        (audio as any).mozPreservesPitch = false;
        (audio as any).mozAutoplayEnabled = true;
      }
      
      // Tvinga fram högsta prioritet för buffring
      if ('preload' in audio) {
        audio.preload = 'auto';
        // @ts-ignore - Webkit-specifikt attribut
        if ('webkitPreservesPitch' in audio) {
          // @ts-ignore
          audio.webkitPreservesPitch = false;
        }
      }
      
      // Sätt media attribut för bättre prestanda
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.setAttribute('controls', 'none');
      
      // Lägg till range request header via en temporär länk
      const url = new URL(track.url);
      url.searchParams.set('range', 'bytes=0-'); // Be om hela filen
      audio.src = url.toString();
      
      const handleLoaded = () => {
        audioRefs.current[track.id] = audio;
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
        console.log(`Track ${track.id} loaded, duration:`, audio.duration);
        resolve();
      };

      const handleCanPlayThrough = () => {
        console.log(`Track ${track.id} can play through`);
      };

      const handleProgress = () => {
        if (audio.buffered.length > 0) {
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          console.log(`Track ${track.id} buffered to:`, bufferedEnd);
        }
      };

      const handleError = (e: Event) => {
        console.error(`Error loading track ${track.id}:`, e);
        // För iOS, försök igen med timeout
        setTimeout(() => {
          audio.load();
        }, 1000);
      };

      const setupAudioEvents = () => {
        audio.addEventListener("loadeddata", handleLoaded);
        audio.addEventListener("error", handleError);
        audio.addEventListener("canplaythrough", handleCanPlayThrough);
        audio.addEventListener("progress", handleProgress);
        
        // Lägg till timeupdate-lyssnare för synkronisering
        audio.addEventListener("timeupdate", () => {
          if (!audio.muted) {
            const currentTime = audio.currentTime;
            Object.values(audioRefs.current).forEach(otherAudio => {
              if (otherAudio !== audio && !otherAudio.muted) {
                const timeDiff = Math.abs(otherAudio.currentTime - currentTime);
                if (timeDiff > 0.1) {
                  otherAudio.currentTime = currentTime;
                }
              }
            });
          }
        });
      };
      
      setupAudioEvents();
      
      // Starta laddningen aggressivt
      audio.load();
      // Försök förbuffa genom att spela och pausa direkt
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {
        // Ignorera fel här, det är okej
      });
    });

    loadingPromises.current[track.id] = loadingPromise;
    return loadingPromise;
  };

  const initializeTracks = async () => {
    const audioContext = initAudioContext();
    
    try {
      // Ladda spåren sekventiellt för bättre stabilitet på iOS
      for (const track of song.tracks) {
        await loadTrack(track);
      }
      
      // Konfigurera varje spår efter laddning
      song.tracks.forEach(track => {
        const audio = audioRefs.current[track.id];
        if (audio) {
          setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
          const shouldBeMuted = track.voicePart !== "all";
          setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

          audio.volume = 1;
          audio.muted = shouldBeMuted;
          
          audio.addEventListener("timeupdate", handleTimeUpdate);
          audio.addEventListener("ended", handleTrackEnd);
        }
      });
      
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    } catch (error) {
      console.error("Error initializing tracks:", error);
    }
  };

  const cleanup = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleTrackEnd);
      audio.removeEventListener("canplaythrough", () => {});
      audio.removeEventListener("progress", () => {});
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    });
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    audioRefs.current = {};
    loadingPromises.current = {};
  };

  return {
    audioRefs,
    initializeTracks,
    cleanup,
  };
};
