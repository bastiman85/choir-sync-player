
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
  const syncIntervalRef = useRef<number | null>(null);
  const lastSyncTime = useRef(0);
  const MIN_SYNC_INTERVAL = 100; // Öka frekvensen till var 100:e ms
  
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
    const now = performance.now();
    if (now - lastSyncTime.current < MIN_SYNC_INTERVAL) {
      return;
    }

    // Använd setInterval istället för requestAnimationFrame för jämnare timing
    if (isPlaying && !syncIntervalRef.current) {
      syncIntervalRef.current = window.setInterval(() => {
        const earliestPosition = getEarliestTrackPosition();
        if (earliestPosition !== null) {
          updateTruePosition(earliestPosition);
          syncTrackPositions(truePosition.current);
          
          // Logga synkroniseringen för debugging
          console.log('--- Kontinuerlig synkronisering ---');
          console.log(`Synkar till position: ${truePosition.current.toFixed(3)}`);
          Object.values(audioRefs.current).forEach(audio => {
            if (!audio.muted && !audio.paused) {
              console.log(`Spår position: ${audio.currentTime.toFixed(3)}`);
            }
          });
          console.log('-------------------------');
        }
      }, MIN_SYNC_INTERVAL);
    } else if (!isPlaying && syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    lastSyncTime.current = now;
  }, [getEarliestTrackPosition, syncTrackPositions, updateTruePosition, isPlaying]);

  const resetTruePosition = useCallback((time: number) => {
    resetPosition(time);
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
  }, [resetPosition]);

  // Rensa intervallet när komponenten avmonteras
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, []);

  // Starta/stoppa synkronisering när isPlaying ändras
  useEffect(() => {
    synchronizeTracks();
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isPlaying, synchronizeTracks]);

  return { synchronizeTracks, resetTruePosition };
};
