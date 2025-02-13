
import { RefObject, useCallback } from "react";
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
  const {
    truePosition,
    resetPosition,
  } = usePlaybackPosition({ setCurrentTime });
  
  const resetTruePosition = useCallback((time: number) => {
    resetPosition(time);
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
  }, [resetPosition]);

  return { resetTruePosition };
};
