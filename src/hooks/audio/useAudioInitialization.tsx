
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

    const loadingPromise = new Promise<void>(async (resolve) => {
      const audio = new Audio();
      
      // Optimeringar för iOS/Safari
      audio.preload = "auto";
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.setAttribute('x-webkit-airplay', 'allow');
      
      // Minska bufferstorleken för bättre prestanda
      audio.mozPreservesPitch = false;
      if ((audio as any).mozFrameBufferLength !== undefined) {
        (audio as any).mozFrameBufferLength = 2048; // Öka bufferstorleken något för stabilare uppspelning
      }
      
      // Lägg till audio.crossOrigin för CORS-hantering
      audio.crossOrigin = "anonymous";
      
      // Optimera för mobila enheter
      if (typeof audio.playbackRate !== 'undefined') {
        audio.playbackRate = 1.0;
      }
      
      // Sätt buffer mode för bättre prestanda
      if ('buffered' in audio) {
        audio.preload = 'auto';
      }
      
      audio.src = track.url;
      
      const handleLoaded = () => {
        audioRefs.current[track.id] = audio;
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };
      
      const setupAudioEvents = () => {
        audio.addEventListener("loadedmetadata", handleLoaded);
        
        // Förbättrad buffringshantering
        audio.addEventListener("waiting", () => {
          console.log(`Track ${track.id} buffering...`);
          // Pausa andra spår om ett spår buffrar
          Object.values(audioRefs.current).forEach(otherAudio => {
            if (otherAudio !== audio && !otherAudio.paused) {
              otherAudio.pause();
            }
          });
        });
        
        audio.addEventListener("canplay", () => {
          console.log(`Track ${track.id} can play`);
          resolve();
        });
        
        audio.addEventListener("error", (e) => {
          console.error(`Error loading track ${track.id}:`, e);
          resolve();
        });
        
        // Lägg till timeupdate-lyssnare för synkronisering
        audio.addEventListener("timeupdate", () => {
          if (!audio.muted) {
            const currentTime = audio.currentTime;
            // Synkronisera andra spår om de hamnar ur synk
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
      
      try {
        await audio.load();
      } catch (error) {
        console.error(`Error loading track ${track.id}:`, error);
        resolve();
      }
    });

    loadingPromises.current[track.id] = loadingPromise;
    return loadingPromise;
  };

  const initializeTracks = async () => {
    const audioContext = initAudioContext();
    
    // Ladda och initiera spår sekventiellt för bättre prestanda
    for (const track of song.tracks) {
      await loadTrack(track);
      
      const audio = audioRefs.current[track.id];
      if (audio) {
        setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
        const shouldBeMuted = track.voicePart !== "all";
        setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

        audio.volume = 1;
        audio.muted = shouldBeMuted;
        
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleTrackEnd);
        
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
      }
    }
  };

  const cleanup = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleTrackEnd);
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
