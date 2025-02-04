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
  const lastUpdateTime = useRef<number>(performance.now());
  const truePosition = useRef<number>(0);
  const updateThreshold = useRef<number>(100); // Minimum time between UI updates in ms
  const lastUIUpdate = useRef<number>(0);
  const uiUpdateInterval = useRef<number | null>(null);

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const now = performance.now();
    const timeDelta = (now - lastUpdateTime.current) / 1000;
    
    if (isPlaying) {
      truePosition.current += timeDelta;
    }
    
    lastUpdateTime.current = now;

    // Only update UI if enough time has passed since the last update
    if (now - lastUIUpdate.current >= updateThreshold.current) {
      lastUIUpdate.current = now;
      
      // Find the earliest position among non-muted playing tracks
      let earliestPosition = Infinity;
      tracks.forEach(track => {
        if (!track.muted && !track.paused) {
          earliestPosition = Math.min(earliestPosition, track.currentTime);
        }
      });

      // If we found a valid position, use it
      if (earliestPosition !== Infinity) {
        // Ensure we don't jump forward, only backward if needed
        if (earliestPosition < truePosition.current || Math.abs(earliestPosition - truePosition.current) > 0.5) {
          truePosition.current = earliestPosition;
        }
      }

      // Update UI with the true position
      setCurrentTime(truePosition.current);
    }

    // Sync tracks that are out of sync
    tracks.forEach((track) => {
      if (!track.muted) {
        const drift = Math.abs(track.currentTime - truePosition.current);
        if (drift > 0.1) {
          // Always set to the true position to maintain sync
          track.currentTime = truePosition.current;
        }

        // Ensure track is playing if it should be
        if (isPlaying && track.paused) {
          track.currentTime = truePosition.current;
          track.play().catch(console.error);
        } else if (!isPlaying && !track.paused) {
          track.pause();
          track.currentTime = truePosition.current;
        }
      }
    });
  };

  const resetTruePosition = (time: number) => {
    truePosition.current = time;
    lastUpdateTime.current = performance.now();
    lastUIUpdate.current = performance.now();
    
    // Force sync all tracks when position is reset
    Object.values(audioRefs.current).forEach(track => {
      track.currentTime = time;
    });
    
    setCurrentTime(time);
  };

  useEffect(() => {
    // Only start sync interval when playing
    if (isPlaying) {
      synchronizeTracks(); // Initial sync
      
      // Update UI more frequently but only while playing
      uiUpdateInterval.current = window.setInterval(() => {
        const now = performance.now();
        if (now - lastUIUpdate.current >= updateThreshold.current) {
          const tracks = Object.values(audioRefs.current);
          
          // Find earliest position among playing tracks
          let earliestPosition = Infinity;
          tracks.forEach(track => {
            if (!track.muted && !track.paused) {
              earliestPosition = Math.min(earliestPosition, track.currentTime);
            }
          });
          
          if (earliestPosition !== Infinity) {
            // Only update if we need to move backward or if drift is significant
            if (earliestPosition < truePosition.current || Math.abs(earliestPosition - truePosition.current) > 0.5) {
              truePosition.current = earliestPosition;
              lastUIUpdate.current = now;
              setCurrentTime(truePosition.current);
            }
          }
        }
      }, 50); // More frequent updates for smoother UI
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