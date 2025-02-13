
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
        if (drift > 0.05) {
          track.currentTime = targetPosition;
        }
      }
    });
  };

  const updateTruePosition = (newPosition: number) => {
    truePosition.current = newPosition;
  };

  return {
    syncTrackPositions,
    updateTruePosition,
  };
};
