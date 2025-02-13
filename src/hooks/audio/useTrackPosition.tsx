
import { RefObject, useCallback } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const SYNC_THRESHOLD = 0.05; // Endast synka om avvikelsen är större än 50ms
  const MAX_SYNC_INTERVAL = 1000; // Max 1 synk per sekund
  let lastSyncTime = 0;

  const syncTrackPositions = useCallback((targetPosition: number) => {
    const now = performance.now();
    if (now - lastSyncTime < MAX_SYNC_INTERVAL) {
      return; // Skippa synk om det var för nära senaste synken
    }

    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        const drift = Math.abs(track.currentTime - targetPosition);
        if (drift > SYNC_THRESHOLD) {
          track.currentTime = targetPosition;
          lastSyncTime = now;
        }
      }
    });
  }, []);

  const updateTruePosition = useCallback((newPosition: number) => {
    const drift = Math.abs(newPosition - truePosition.current);
    if (drift > SYNC_THRESHOLD) {
      truePosition.current = newPosition;
    }
  }, [truePosition]);

  return {
    syncTrackPositions,
    updateTruePosition,
  };
};
