
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
  const SYNC_PAUSE_DURATION = 50; // Kort paus för att säkerställa synkronisering

  const getActiveAudioElements = () => {
    return Object.values(audioRefs.current).filter(audio => !audio.muted);
  };

  const togglePlayPause = (isPlaying: boolean) => {
    if (isPlaying) {
      getActiveAudioElements().forEach((audio) => {
        audio.pause();
      });
      setIsPlaying(false);
    } else {
      const activeAudios = getActiveAudioElements();
      if (activeAudios.length === 0) return;

      // Hitta den tidigaste positionen bland aktiva spår
      let earliestPosition = Infinity;
      activeAudios.forEach(audio => {
        earliestPosition = Math.min(earliestPosition, audio.currentTime);
      });
      
      // Synkronisera alla aktiva spår till den tidigaste tidpunkten
      activeAudios.forEach((audio) => {
        audio.pause();
        audio.currentTime = earliestPosition;
      });
      
      setCurrentTime(earliestPosition);
      resetTruePosition(earliestPosition);
      
      // Lägg till en kort paus innan uppspelningen startas för att säkerställa synkronisering
      setTimeout(() => {
        const promises = getActiveAudioElements().map(audio => {
          audio.currentTime = earliestPosition;
          return audio.play();
        });
        
        // Vänta tills alla spår har startat innan vi sätter isPlaying
        Promise.all(promises)
          .then(() => {
            setIsPlaying(true);
            console.log('Alla spår startade synkroniserat på position:', earliestPosition);
          })
          .catch(console.error);
      }, SYNC_PAUSE_DURATION);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    const activeAudios = getActiveAudioElements();
    const wasPlaying = activeAudios.some(audio => !audio.paused);
    
    // Pausa och synka alla spår
    activeAudios.forEach((audio) => {
      audio.pause();
      audio.currentTime = newTime;
    });
    
    setCurrentTime(newTime);
    resetTruePosition(newTime);
    
    if (wasPlaying) {
      // Om det spelades innan, starta om uppspelningen synkroniserat
      setTimeout(() => {
        const promises = activeAudios.map(audio => {
          audio.currentTime = newTime;
          return audio.play();
        });
        
        Promise.all(promises)
          .then(() => {
            setIsPlaying(true);
            console.log('Alla spår startade om synkroniserat på position:', newTime);
          })
          .catch(console.error);
      }, SYNC_PAUSE_DURATION);
    }
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
