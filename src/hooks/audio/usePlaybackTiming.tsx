import { RefObject, useRef } from "react";

interface UsePlaybackTimingProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
}

export const usePlaybackTiming = ({ audioRefs, isPlaying }: UsePlaybackTimingProps) => {
  const lastSyncTime = useRef<number>(performance.now());
  const syncInterval = useRef<number>(50); // 50ms sync interval

  const shouldSync = (now: number) => {
    return now - lastSyncTime.current >= syncInterval.current;
  };

  const updateSyncTime = (time: number) => {
    lastSyncTime.current = time;
  };

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
    shouldSync,
    updateSyncTime,
    getEarliestTrackPosition,
  };
};