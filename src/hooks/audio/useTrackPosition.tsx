
import { RefObject } from "react";

interface UseTrackPositionProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  truePosition: React.MutableRefObject<number>;
}

export const useTrackPosition = ({ audioRefs, truePosition }: UseTrackPositionProps) => {
  const syncTrackPositions = async (targetPosition: number) => {
    const tracks = Object.values(audioRefs.current);
    
    // Pausa alla spår under synkroniseringen
    tracks.forEach(track => {
      if (!track.muted && !track.paused) {
        track.pause();
      }
    });

    // Uppdatera positioner och vänta på buffring
    const bufferingPromises = tracks.map(track => {
      return new Promise<void>((resolve) => {
        if (!track.muted) {
          track.currentTime = targetPosition;
          
          const handleCanPlay = () => {
            track.removeEventListener('canplay', handleCanPlay);
            resolve();
          };
          
          track.addEventListener('canplay', handleCanPlay);
          
          // Sätt en timeout för att undvika att hänga om canplay inte triggas
          setTimeout(resolve, 1500);
        } else {
          resolve();
        }
      });
    });

    // Vänta på att alla spår ska buffras, men max 1.5 sekunder
    try {
      await Promise.race([
        Promise.all(bufferingPromises),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
    } catch (error) {
      console.error("Error during buffering:", error);
    }

    // Återuppta uppspelning av alla spår samtidigt
    tracks.forEach(track => {
      if (!track.muted) {
        track.playbackRate = 1;
        track.play().catch(console.error);
      }
    });
  };

  return {
    syncTrackPositions,
  };
};
