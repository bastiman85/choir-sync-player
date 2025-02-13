
import { RefObject } from "react";

interface UseAudioControlsProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  setIsPlaying: (value: boolean) => void;
  setCurrentTime: (value: number) => void;
  resetTruePosition: (time: number) => void;
}

export const useAudioControls = ({
  audioRefs,
  setIsPlaying,
  setCurrentTime,
  resetTruePosition,
}: UseAudioControlsProps) => {
  const SYNC_PAUSE_DURATION = 100; // 100ms paus för att låta spåren justeras

  const togglePlayPause = (isPlaying: boolean) => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
      setIsPlaying(false);
    } else {
      const currentTime = Object.values(audioRefs.current)[0]?.currentTime || 0;
      
      // Logga startpositioner för alla spår
      console.log('--- Spår startpositioner ---');
      console.log(`App currentTime: ${currentTime.toFixed(3)} sekunder`);
      Object.entries(audioRefs.current).forEach(([trackId, audio]) => {
        console.log(`Spår ${trackId}: ${audio.currentTime.toFixed(3)} sekunder`);
      });
      console.log('-------------------------');
      
      // Synkronisera alla spår till samma tidpunkt och resettera den sanna positionen
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = currentTime;
      });
      
      setCurrentTime(currentTime);
      resetTruePosition(currentTime);
      
      // Lägg till en kort paus innan uppspelningen startas
      setTimeout(() => {
        Object.values(audioRefs.current).forEach((audio) => {
          audio.play().catch(console.error);
        });
      }, SYNC_PAUSE_DURATION);
      
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setIsPlaying(false);
    
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = newTime;
    });
    
    setCurrentTime(newTime);
    resetTruePosition(newTime);
    
    // Lägg till en kort paus innan uppspelningen återupptas
    setTimeout(() => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.play().catch(console.error);
      });
      setIsPlaying(true);
    }, SYNC_PAUSE_DURATION);
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
  };

  return {
    togglePlayPause,
    handleSeek,
    handleTrackEnd,
  };
};
