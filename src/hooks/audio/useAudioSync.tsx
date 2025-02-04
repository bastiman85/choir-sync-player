import { RefObject, useEffect, useRef } from "react";
import { usePlaybackPosition } from "./usePlaybackPosition";
import { useTrackSync } from "./useTrackSync";

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

  const { findEarliestPosition, syncTracks } = useTrackSync({
    audioRefs,
    truePosition,
    isPlaying,
  });

  const synchronizeTracks = () => {
    const now = updatePosition(isPlaying);
    
    if (shouldUpdateUI(now)) {
      const earliestPosition = findEarliestPosition();
      if (earliestPosition !== null) {
        // Only update UI if moving backward or significant drift
        if (earliestPosition < truePosition.current || 
            Math.abs(earliestPosition - truePosition.current) > 0.5) {
          updateUIPosition(earliestPosition);
        }
      }
    }

    syncTracks();
  };

  const resetTruePosition = (time: number) => {
    resetPosition(time);
    
    // Force sync all tracks when position is reset
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      synchronizeTracks(); // Initial sync
      
      uiUpdateInterval.current = window.setInterval(() => {
        const now = performance.now();
        if (shouldUpdateUI(now)) {
          const earliestPosition = findEarliestPosition();
          if (earliestPosition !== null) {
            // Only update if moving backward or significant drift
            if (earliestPosition < truePosition.current || 
                Math.abs(earliestPosition - truePosition.current) > 0.5) {
              updateUIPosition(earliestPosition);
            }
          }
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