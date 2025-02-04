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
  const lastUpdateTime = useRef<number>(performance.now());
  const truePosition = useRef<number>(0);
  const lastUIUpdate = useRef<number>(0);

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const now = performance.now();
    const timeDelta = (now - lastUpdateTime.current) / 1000;
    
    if (isPlaying) {
      truePosition.current += timeDelta;
    }
    
    lastUpdateTime.current = now;

    // Update UI every 100ms to prevent jumpy scrubber but maintain responsiveness
    if (now - lastUIUpdate.current >= 100) {
      if (Math.abs(currentTime - truePosition.current) > 0.05) {
        setCurrentTime(truePosition.current);
        lastUIUpdate.current = now;
      }
    }

    const SYNC_THRESHOLD = 0.05; // 50ms threshold

    tracks.forEach((track) => {
      if (!track.muted) {
        // Simple sync check without drift compensation
        if (Math.abs(track.currentTime - truePosition.current) > SYNC_THRESHOLD) {
          track.currentTime = truePosition.current;
        }

        // Ensure track is playing if it should be
        if (isPlaying && track.paused) {
          track.play().catch(console.error);
        } else if (!isPlaying && !track.paused) {
          track.pause();
        }
      }
    });
  };

  const resetTruePosition = (time: number) => {
    truePosition.current = time;
    lastUpdateTime.current = performance.now();
    lastUIUpdate.current = performance.now();
    setCurrentTime(time);
  };

  useEffect(() => {
    // Start sync interval when playing
    if (isPlaying && !syncCheckInterval.current) {
      synchronizeTracks(); // Initial sync
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