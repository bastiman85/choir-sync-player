import { RefObject } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const syncTrackPositions = (targetPosition: number) => {
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted) {
        const drift = Math.abs(track.currentTime - targetPosition);
        if (drift > 0.1 && track.currentTime > targetPosition) {
          track.currentTime = targetPosition;
        }
      }
    });
  };

  const updateTruePosition = (newPosition: number) => {
    // Never allow forward jumps, only backward corrections
    if (newPosition < truePosition.current) {
      truePosition.current = newPosition;
    }
  };

  return {
    syncTrackPositions,
    updateTruePosition,
  };
};