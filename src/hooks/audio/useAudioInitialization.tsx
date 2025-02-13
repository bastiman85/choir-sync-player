
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
      
      // Sätt källa direkt
      audio.src = track.url;
      
      const handleLoaded = () => {
        audioRefs.current[track.id] = audio;
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
        resolve();
      };

      const handleError = (e: Event) => {
        console.error(`Error loading track ${track.id}`);
        resolve();
      };

      const setupAudioEvents = () => {
        audio.addEventListener("loadeddata", handleLoaded);
        audio.addEventListener("error", handleError);
        
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
      audio.load();
    });

    loadingPromises.current[track.id] = loadingPromise;
    return loadingPromise;
  };

  const initializeTracks = async () => {
    const audioContext = initAudioContext();
    
    try {
      // Ladda alla spår parallellt
      const loadPromises = song.tracks.map(track => loadTrack(track));
      await Promise.all(loadPromises);
      
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
