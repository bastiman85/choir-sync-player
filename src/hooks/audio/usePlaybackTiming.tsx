
import { RefObject, useRef } from "react";

interface UsePlaybackTimingProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
}

export const usePlaybackTiming = ({ audioRefs, isPlaying }: UsePlaybackTimingProps) => {
  const getEarliestTrackPosition = () => {
    let earliestPosition = Infinity;
    let validTrackFound = false;
    
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused && !isNaN(track.currentTime)) {
        earliestPosition = Math.min(earliestPosition, track.currentTime);
        validTrackFound = true;
      }
    });
    
    return validTrackFound ? earliestPosition : null;
  };

  return {
    getEarliestTrackPosition,
  };
};
