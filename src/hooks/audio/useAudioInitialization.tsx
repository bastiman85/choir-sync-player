
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
  const objectUrlsRef = useRef<{ [key: string]: string }>({});

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
      
      // Särskilda inställningar för iOS/Safari
      audio.preload = "auto";
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.setAttribute('controlsList', 'nodownload');
      
      // Minska bufferstorleken för jämnare uppspelning
      if ((audio as any).mozAutoplayEnabled !== undefined) {
        (audio as any).mozAutoplayEnabled = true;
      }
      if ((audio as any).mozFrameBufferLength !== undefined) {
        (audio as any).mozFrameBufferLength = 1024;
      }
      
      // Ladda ljudet i mindre delar
      try {
        const response = await fetch(track.url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        audio.src = objectUrl;
        
        // Spara object URL för senare cleanup
        objectUrlsRef.current[track.id] = objectUrl;
      } catch (error) {
        console.error("Error loading audio:", error);
        resolve();
        return;
      }
      
      const handleLoaded = () => {
        audioRefs.current[track.id] = audio;
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };
      
      const setupAudioEvents = () => {
        audio.addEventListener("loadedmetadata", handleLoaded);
        
        // Hantera buffering
        audio.addEventListener("waiting", () => {
          console.log("Audio buffering...");
        });
        
        audio.addEventListener("canplay", () => {
          console.log("Audio can play");
          resolve();
        });
        
        // Stäng av timeout för buffering på iOS
        if ((audio as any).webkitPreservesPitch !== undefined) {
          (audio as any).webkitPreservesPitch = false;
        }
      };
      
      setupAudioEvents();
      
      try {
        await audio.load();
      } catch (error) {
        console.error("Error loading audio:", error);
        resolve();
      }
    });

    loadingPromises.current[track.id] = loadingPromise;
    return loadingPromise;
  };

  const initializeTracks = async () => {
    const audioContext = initAudioContext();
    
    // Ladda spår i mindre grupper för att minska minnesanvändningen
    const batchSize = 1;
    for (let i = 0; i < song.tracks.length; i += batchSize) {
      const batch = song.tracks.slice(i, i + batchSize);
      await Promise.all(batch.map(track => loadTrack(track)));
      
      batch.forEach(track => {
        const audio = audioRefs.current[track.id];
        if (audio) {
          setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
          const shouldBeMuted = track.voicePart !== "all";
          setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

          audio.volume = 1;
          audio.muted = shouldBeMuted;
          
          // Sätt upp event listeners
          audio.removeEventListener("timeupdate", handleTimeUpdate);
          audio.addEventListener("timeupdate", handleTimeUpdate);
          audio.addEventListener("ended", handleTrackEnd);
          
          // Förbättra uppspelning på iOS
          if (audioContext.state === "suspended") {
            audioContext.resume();
          }
        }
      });
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
    
    // Rensa object URLs
    Object.values(objectUrlsRef.current).forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    audioRefs.current = {};
    loadingPromises.current = {};
    objectUrlsRef.current = {};
  };

  return {
    audioRefs,
    initializeTracks,
    cleanup,
  };
};
