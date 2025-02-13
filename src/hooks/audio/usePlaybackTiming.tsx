
import { RefObject } from "react";

interface UsePlaybackTimingProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
}

export const usePlaybackTiming = ({ audioRefs, isPlaying }: UsePlaybackTimingProps) => {
  const getEarliestTrackPosition = () => {
    let earliestPosition = Infinity;
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        earliestPosition = Math.min(earliestPosition, track.currentTime);
      }
    });
    return earliestPosition !== Infinity ? earliestPosition : null;
  };

  return {
    getEarliestTrackPosition,
  };
};
