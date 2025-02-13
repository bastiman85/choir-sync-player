
import { RefObject } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const syncTrackPositions = (targetPosition: number) => {
    const tracks = Object.values(audioRefs.current);
    
    tracks.forEach(track => {
      if (!track.muted && !track.paused) {
        const drift = Math.abs(track.currentTime - targetPosition);
        
        // Synkronisera endast om driften är betydande
        if (drift > 0.1) {
          // Använd en mjukare korrigering för mindre drifter
          if (drift < 0.3) {
            track.playbackRate = track.currentTime > targetPosition ? 0.95 : 1.05;
            setTimeout(() => {
              track.playbackRate = 1;
            }, 100);
          } else {
            // För större drifter, gör en direkt korrigering
            track.currentTime = targetPosition;
          }
        } else {
          track.playbackRate = 1;
        }
      }
    });
  };

  return {
    syncTrackPositions,
  };
};
