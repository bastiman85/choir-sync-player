
import { RefObject } from "react";
import { usePlaybackTiming } from "./usePlaybackTiming";

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
  const synchronizeTracks = async () => {
    // Pausa alla spår först
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted) {
        track.pause();
      }
    });

    // Hitta en synkpunkt strax innan nuvarande position
    const syncPoint = Math.max(0, currentTime - 0.2);

    // Sätt alla spår till synkpunkten
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted) {
        track.currentTime = syncPoint;
      }
    });

    // Kort paus för att säkerställa att allt är redo
    await new Promise(resolve => setTimeout(resolve, 50));

    // Starta alla spår igen från synkpunkten om vi ska spela
    if (isPlaying) {
      Object.values(audioRefs.current).forEach(track => {
        if (!track.muted) {
          track.play().catch(console.error);
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
