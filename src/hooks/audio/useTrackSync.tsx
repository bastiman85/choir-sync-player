import { RefObject } from "react";

interface UseTrackSyncProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
  isPlaying: boolean;
}

export const useTrackSync = ({ audioRefs, truePosition, isPlaying }: UseTrackSyncProps) => {
  const findEarliestPosition = () => {
    let earliestPosition = Infinity;
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        earliestPosition = Math.min(earliestPosition, track.currentTime);
      }
    });
    return earliestPosition !== Infinity ? earliestPosition : null;
  };

  const syncTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const earliestPosition = findEarliestPosition();
    
    if (earliestPosition !== null) {
      // Only move backward or if significant drift
      if (earliestPosition < truePosition.current || 
          Math.abs(earliestPosition - truePosition.current) > 0.5) {
        truePosition.current = earliestPosition;
      }
    }

    // Sync all non-muted tracks
    tracks.forEach((track) => {
      if (!track.muted) {
        const drift = Math.abs(track.currentTime - truePosition.current);
        if (drift > 0.1) {
          track.currentTime = truePosition.current;
        }

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

  return {
    findEarliestPosition,
    syncTracks,
  };
};