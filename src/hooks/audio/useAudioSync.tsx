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
    const SYNC_THRESHOLD = 0.05;
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
  };

  // Separate function for UI updates
  const updateUI = () => {
    const now = performance.now();
    if (now - lastUIUpdate.current >= 100) {
      if (Math.abs(currentTime - truePosition.current) > 0.05) {
        setCurrentTime(truePosition.current);
        lastUIUpdate.current = now;
      }
    }
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
    // Only start UI update interval when playing
    if (isPlaying && !uiUpdateInterval.current) {
      synchronizeTracks(); // Initial sync
      uiUpdateInterval.current = window.setInterval(updateUI, 100);
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