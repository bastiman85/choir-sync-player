
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

  const { getEarliestTrackPosition } = usePlaybackTiming({
    audioRefs,
    isPlaying,
  });

  const { syncTrackPositions, updateTruePosition } = useTrackPosition({
    audioRefs,
    truePosition,
  });

  const synchronizeTracks = () => {
    const earliestPosition = getEarliestTrackPosition();
    if (earliestPosition !== null) {
      updateTruePosition(earliestPosition);
      syncTrackPositions(truePosition.current);
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
      // Uppdatera bara UI-position under uppspelning, ingen kontinuerlig synkning
      uiUpdateInterval.current = window.setInterval(() => {
        const earliestPosition = getEarliestTrackPosition();
        if (earliestPosition !== null) {
          updateUIPosition(earliestPosition);
        }
      }, 50);
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
