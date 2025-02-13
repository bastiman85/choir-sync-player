
import { RefObject } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const syncTrackPositions = (targetPosition: number) => {
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        const drift = Math.abs(track.currentTime - targetPosition);
        // Minska toleransen för drift från 0.05 till 0.02 sekunder
        if (drift > 0.02) {
          track.currentTime = targetPosition;
        }
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
