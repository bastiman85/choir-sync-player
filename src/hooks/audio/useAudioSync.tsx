import { RefObject, useEffect, useRef } from "react";

interface UseAudioSyncProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export const useAudioSync = ({
  audioRefs,
  isPlaying,
  currentTime,
  setCurrentTime,
}: UseAudioSyncProps) => {
  const lastUpdateTime = useRef<number>(performance.now());
  const truePosition = useRef<number>(0);
  const lastUIUpdate = useRef<number>(0);
  const uiUpdateInterval = useRef<number | null>(null);

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const now = performance.now();
    const timeDelta = (now - lastUpdateTime.current) / 1000;
    
    if (isPlaying) {
      truePosition.current += timeDelta;
    }
    
    lastUpdateTime.current = now;

    // Only force sync tracks during specific events (not continuously)
    tracks.forEach((track) => {
      if (!track.muted) {
        // Ensure track is playing if it should be
        if (isPlaying && track.paused) {
          track.currentTime = truePosition.current;
          track.play().catch(console.error);
        } else if (!isPlaying && !track.paused) {
          track.pause();
          track.currentTime = truePosition.current;
        }
      }
    });

    // Always update UI with the true position to avoid jumpiness
    setCurrentTime(truePosition.current);
  };

  const resetTruePosition = (time: number) => {
    truePosition.current = time;
    lastUpdateTime.current = performance.now();
    lastUIUpdate.current = performance.now();
    
    // Force sync all tracks when position is reset
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
    
    setCurrentTime(time);
  };

  useEffect(() => {
    // Only start sync interval when playing
    if (isPlaying) {
      synchronizeTracks(); // Initial sync
      
      // Update UI more frequently but only while playing
      uiUpdateInterval.current = window.setInterval(() => {
        const now = performance.now();
        const timeDelta = (now - lastUpdateTime.current) / 1000;
        truePosition.current += timeDelta;
        lastUpdateTime.current = now;
        
        // Update UI with true position
        setCurrentTime(truePosition.current);
      }, 50); // More frequent updates for smoother UI
    }
    
    return () => {
      if (uiUpdateInterval.current) {
        clearInterval(uiUpdateInterval.current);
        uiUpdateInterval.current = null;
      }
    };
  }, [isPlaying]);

  return { synchronizeTracks, resetTruePosition };
};