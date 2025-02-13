
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
  const syncIntervalRef = useRef<number | null>(null);
  const lastSyncTime = useRef<number>(0);
  const syncThreshold = useRef<number>(0.1); // 100ms synktröskel
  
  const {
    truePosition,
    updatePosition,
    resetPosition,
    updateUIPosition,
  } = usePlaybackPosition({ setCurrentTime });

  const { getEarliestTrackPosition } = usePlaybackTiming({
    audioRefs,
    isPlaying,
  });

  const { syncTrackPositions } = useTrackPosition({
    audioRefs,
    truePosition,
  });

  const synchronizeTracks = () => {
    const now = performance.now();
    const timeSinceLastSync = now - lastSyncTime.current;
    
    // Optimera synkroniseringsfrekvensen
    if (timeSinceLastSync < 50) { // Undvik för täta synkroniseringar
      return;
    }

    updatePosition(isPlaying);
    const earliestPosition = getEarliestTrackPosition();
    
    if (earliestPosition !== null) {
      const tracks = Object.values(audioRefs.current);
      let maxDrift = 0;
      
      // Beräkna max drift mellan spåren
      tracks.forEach(track => {
        if (!track.muted && !track.paused) {
          const drift = Math.abs(track.currentTime - earliestPosition);
          maxDrift = Math.max(maxDrift, drift);
        }
      });

      // Synkronisera endast om driften är över tröskeln
      if (maxDrift > syncThreshold.current) {
        syncTrackPositions(earliestPosition);
        truePosition.current = earliestPosition;
      }
    }

    lastSyncTime.current = now;
  };

  useEffect(() => {
    if (isPlaying) {
      // Använd RequestAnimationFrame för jämnare uppdateringar
      const updateUI = () => {
        const earliestPosition = getEarliestTrackPosition();
        if (earliestPosition !== null) {
          updateUIPosition(earliestPosition);
        }
        
        if (isPlaying) {
          requestAnimationFrame(updateUI);
        }
      };

      requestAnimationFrame(updateUI);

      // Synkronisera spåren med ett fast intervall
      syncIntervalRef.current = window.setInterval(() => {
        synchronizeTracks();
      }, 100);
    }
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  const resetTruePosition = (time: number) => {
    resetPosition(time);
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted) {
        track.currentTime = time;
      }
    });
  };

  return { synchronizeTracks, resetTruePosition };
};
