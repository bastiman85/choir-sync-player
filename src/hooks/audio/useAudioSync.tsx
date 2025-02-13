
import { RefObject, useRef } from "react";
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
  const { getEarliestTrackPosition } = usePlaybackTiming({
    audioRefs,
    isPlaying,
  });

  const synchronizeTracks = () => {
    const earliestPosition = getEarliestTrackPosition();
    if (earliestPosition !== null) {
      Object.values(audioRefs.current).forEach(track => {
        if (!track.muted) {
          track.currentTime = earliestPosition;
        }
      });
    }
  };

  const resetTruePosition = (time: number) => {
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
    
    if (isPlaying) {
      Object.values(audioRefs.current).forEach(track => {
        if (!track.muted) {
          track.play().catch(console.error);
        }
      });
    }
  };

  return { synchronizeTracks, resetTruePosition };
};
