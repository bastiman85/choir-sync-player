
import { RefObject, useCallback } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const SYNC_THRESHOLD = 0.02; // Sänk tröskelvärdet till 20ms för mer aggressiv synkning
  const MAX_SYNC_INTERVAL = 100; // Sänk till 100ms för tätare synkronisering
  let lastSyncTime = 0;

  const syncTrackPositions = useCallback((targetPosition: number) => {
    const now = performance.now();
    if (now - lastSyncTime < MAX_SYNC_INTERVAL) {
      return;
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
