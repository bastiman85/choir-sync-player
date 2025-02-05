import { RefObject, useEffect, useRef } from "react";
import { usePlaybackTiming } from "./usePlaybackTiming";
import { useTrackPosition } from "./useTrackPosition";
import { usePlaybackPosition } from "./usePlaybackPosition";

interface UseAudioSyncProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export const useAudioSync = ({
  audioRefs,
  isPlaying,
  currentTime,
  setCurrentTime,
}: UseAudioSyncProps) => {
  const uiUpdateInterval = useRef<number | null>(null);
  
  const {
    truePosition,
    updatePosition,
    resetPosition,
    updateUIPosition,
    shouldUpdateUI,
  } = usePlaybackPosition({ setCurrentTime });

  const { shouldSync, updateSyncTime, getEarliestTrackPosition } = usePlaybackTiming({
    audioRefs,
    isPlaying,
  });

  const { syncTrackPositions, updateTruePosition } = useTrackPosition({
    audioRefs,
    truePosition,
  });

  const synchronizeTracks = () => {
    // Only sync if there's significant drift (more than 0.5 seconds)
    const earliestPosition = getEarliestTrackPosition();
    if (earliestPosition !== null) {
      Object.values(audioRefs.current).forEach(track => {
        if (!track.muted && Math.abs(track.currentTime - earliestPosition) > 0.5) {
          track.currentTime = earliestPosition;
        }
      });
    }
  };

  const resetTruePosition = (time: number) => {
    resetPosition(time);
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      // Reduce sync check frequency to avoid interference with looping
      uiUpdateInterval.current = window.setInterval(() => {
        synchronizeTracks();
      }, 1000); // Check every second instead of every 50ms
    }
    
    return () => {
      if (uiUpdateInterval.current) {
        clearInterval(uiUpdateInterval.current);
        uiUpdateInterval.current = null;
      }
    };
  }, [isPlaying]);

  return { synchronizeTracks, resetTruePosition };
};