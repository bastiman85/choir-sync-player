import { RefObject, useEffect, useRef } from "react";

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
  const syncCheckInterval = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());
  const truePosition = useRef<number>(0);
  const lastUIUpdate = useRef<number>(0);
  const driftCompensation = useRef<{ [key: string]: number }>({});

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const now = performance.now(); // Use performance.now() for more precise timing
    const timeDelta = (now - lastUpdateTime.current) / 1000;
    
    if (isPlaying) {
      truePosition.current += timeDelta;
    }
    
    lastUpdateTime.current = now;

    // Only update UI every 250ms to prevent jumpy scrubber
    if (now - lastUIUpdate.current >= 250) {
      if (Math.abs(currentTime - truePosition.current) > 0.05) {
        setCurrentTime(truePosition.current);
        lastUIUpdate.current = now;
      }
    }

    // More precise sync threshold and drift compensation
    const SYNC_THRESHOLD = 0.02; // 20ms threshold
    const MAX_DRIFT = 0.1; // Maximum allowed drift before hard sync

    tracks.forEach((track) => {
      if (!track.muted && !track.paused) {
        const trackId = track.src; // Use src as unique identifier
        const currentDrift = track.currentTime - truePosition.current;
        
        // Initialize drift compensation if needed
        if (!driftCompensation.current[trackId]) {
          driftCompensation.current[trackId] = 0;
        }

        // Update drift compensation
        driftCompensation.current[trackId] += currentDrift * 0.1; // Gradual drift correction
        
        // Apply drift compensation
        const compensatedPosition = truePosition.current + driftCompensation.current[trackId];
        
        // Check if track needs sync
        if (Math.abs(track.currentTime - compensatedPosition) > SYNC_THRESHOLD) {
          if (Math.abs(currentDrift) > MAX_DRIFT) {
            // Hard sync if drift is too large
            track.currentTime = truePosition.current;
            driftCompensation.current[trackId] = 0;
          } else {
            // Soft sync with drift compensation
            track.currentTime = compensatedPosition;
          }
        }
      }
    });
  };

  // Reset true position when seeking
  const resetTruePosition = (time: number) => {
    truePosition.current = time;
    lastUpdateTime.current = performance.now();
    lastUIUpdate.current = performance.now();
    driftCompensation.current = {}; // Reset drift compensation
    setCurrentTime(time);
  };

  useEffect(() => {
    if (isPlaying && !syncCheckInterval.current) {
      // Increase sync frequency to 30ms for more precise sync
      syncCheckInterval.current = window.setInterval(synchronizeTracks, 30);
    }
    return () => {
      if (syncCheckInterval.current) {
        clearInterval(syncCheckInterval.current);
        syncCheckInterval.current = null;
      }
    };
  }, [isPlaying]);

  return { synchronizeTracks, resetTruePosition };
};