
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
    const earliestPosition = getEarliestTrackPosition();
    if (earliestPosition !== null) {
      Object.values(audioRefs.current).forEach(track => {
        if (!track.muted && !track.paused) {
          const drift = Math.abs(track.currentTime - earliestPosition);
          if (drift > 0.05) {
            track.currentTime = earliestPosition;
          }
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

  return { synchronizeTracks, resetTruePosition };
};
