
import { RefObject, useCallback } from "react";

interface UsePlaybackTimingProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
}

export const usePlaybackTiming = ({ audioRefs, isPlaying }: UsePlaybackTimingProps) => {
  const getEarliestTrackPosition = useCallback(() => {
    let earliestPosition = Infinity;
    let activeTrackCount = 0;
    
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        earliestPosition = Math.min(earliestPosition, track.currentTime);
        activeTrackCount++;
      }
    });
    
    // Om det bara finns ett aktivt spår, hoppa över synkronisering
    if (activeTrackCount <= 1) {
      return null;
    }
    
    return earliestPosition !== Infinity ? earliestPosition : null;
  }, []);

  return {
    getEarliestTrackPosition,
  };
};
