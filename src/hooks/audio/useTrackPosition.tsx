
import { RefObject } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const SYNC_OFFSET = 0.2; // 200ms offset för att kompensera för latens

  const syncTrackPositions = (targetPosition: number) => {
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        track.currentTime = Math.max(0, targetPosition - SYNC_OFFSET);
      }
    });
  };

  const updateTruePosition = (newPosition: number) => {
    // Tillåt endast bakåtjustering för att undvika tidshopp framåt
    if (newPosition < truePosition.current) {
      truePosition.current = newPosition;
    }
  };

  return {
    syncTrackPositions,
    updateTruePosition,
  };
};
