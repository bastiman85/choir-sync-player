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
  const syncCheckInterval = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const truePosition = useRef<number>(0);
  const lastUIUpdate = useRef<number>(0);

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const now = Date.now();
    const timeDelta = (now - lastUpdateTime.current) / 1000;
    
    if (isPlaying) {
      truePosition.current += timeDelta;
    }
    
    lastUpdateTime.current = now;

    // Only update UI every 250ms to prevent jumpy scrubber
    if (now - lastUIUpdate.current >= 250) {
      if (Math.abs(currentTime - truePosition.current) > 0.1) {
        setCurrentTime(truePosition.current);
        lastUIUpdate.current = now;
      }
    }

    // Sync tracks that are significantly out of sync (more than 0.1 seconds)
    tracks.forEach((track) => {
      if (!track.muted && Math.abs(track.currentTime - truePosition.current) > 0.1) {
        track.currentTime = truePosition.current;
      }
    });
  };

  // Reset true position when seeking
  const resetTruePosition = (time: number) => {
    truePosition.current = time;
    lastUpdateTime.current = Date.now();
    lastUIUpdate.current = Date.now();
    setCurrentTime(time); // Ensure UI is updated immediately after seeking
  };

  useEffect(() => {
    if (isPlaying && !syncCheckInterval.current) {
      // Keep the 50ms interval for track sync, but UI updates are throttled
      syncCheckInterval.current = window.setInterval(synchronizeTracks, 50);
    }
    return () => {
      if (syncCheckInterval.current) {
        clearInterval(syncCheckInterval.current);
        syncCheckInterval.current = null;
      }
    };
  }, [isPlaying]);

  return { synchronizeTracks, resetTruePosition };
};
