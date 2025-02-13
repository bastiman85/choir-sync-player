
import { RefObject, useEffect, useRef, useCallback } from "react";
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
  const syncFrameRef = useRef<number | null>(null);
  const lastSyncTime = useRef(0);
  const MIN_SYNC_INTERVAL = 500; // Minst 500ms mellan synkar
  
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

  const synchronizeTracks = useCallback(() => {
    if (syncFrameRef.current) {
      cancelAnimationFrame(syncFrameRef.current);
    }

    const now = performance.now();
    if (now - lastSyncTime.current < MIN_SYNC_INTERVAL) {
      return; // Skippa synk om det var för nära senaste synken
    }

    syncFrameRef.current = requestAnimationFrame(() => {
      const earliestPosition = getEarliestTrackPosition();
      if (earliestPosition !== null) {
        updateTruePosition(earliestPosition);
        syncTrackPositions(truePosition.current);
        lastSyncTime.current = now;
      }
    });
  }, [getEarliestTrackPosition, syncTrackPositions, updateTruePosition]);

  const resetTruePosition = useCallback((time: number) => {
    resetPosition(time);
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
  }, [resetPosition]);

  useEffect(() => {
    return () => {
      if (syncFrameRef.current) {
        cancelAnimationFrame(syncFrameRef.current);
      }
    };
  }, []);

  return { synchronizeTracks, resetTruePosition };
};
