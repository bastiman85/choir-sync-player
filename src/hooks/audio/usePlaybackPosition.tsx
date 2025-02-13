
import { RefObject, useRef } from "react";

interface UsePlaybackPositionProps {
  setCurrentTime: (time: number) => void;
}

export const usePlaybackPosition = ({ setCurrentTime }: UsePlaybackPositionProps) => {
  const truePosition = useRef<number>(0);
  const lastUpdateTime = useRef<number>(performance.now());
  const lastUIUpdate = useRef<number>(0);
  const updateThreshold = useRef<number>(100);

  const shouldUpdateUI = (now: number) => {
    return now - lastUIUpdate.current >= updateThreshold.current;
  };

  const updatePosition = (isPlaying: boolean) => {
    const now = performance.now();
    const timeDelta = (now - lastUpdateTime.current) / 1000;
    
    if (isPlaying) {
      truePosition.current += timeDelta;
    }
    
    lastUpdateTime.current = now;
    return now;
  };

  const resetPosition = (time: number) => {
    truePosition.current = time;
    lastUpdateTime.current = performance.now();
    lastUIUpdate.current = performance.now();
    setCurrentTime(time);
  };

  const updateUIPosition = (position: number) => {
    truePosition.current = position;
    lastUIUpdate.current = performance.now();
    setCurrentTime(position);
  };

  return {
    truePosition,
    updatePosition,
    resetPosition,
    updateUIPosition,
    shouldUpdateUI,
  };
};
