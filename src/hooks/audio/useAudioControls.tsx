
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
      
      // Logga startpositioner för alla spår
      console.log('--- Spår startpositioner ---');
      console.log(`App currentTime: ${earliestPosition.toFixed(3)} sekunder`);
      Object.entries(audioRefs.current).forEach(([trackId, audio]) => {
        if (!audio.muted) {
          console.log(`Spår ${trackId}: ${audio.currentTime.toFixed(3)} sekunder`);
        }
      });
      console.log('-------------------------');
      
      // Synkronisera alla aktiva spår till den tidigaste tidpunkten
      activeAudios.forEach((audio) => {
        audio.pause();
        audio.currentTime = earliestPosition;
      });
      
      setCurrentTime(earliestPosition);
      resetTruePosition(earliestPosition);
      
      // Lägg till en kort paus innan uppspelningen startas
      setTimeout(() => {
        // Hämta aktiva spår igen för att säkerställa att vi har alla
        const updatedActiveAudios = getActiveAudioElements();
        let startPosition = Infinity;
        
        // Hitta tidigaste position igen innan uppspelning
        updatedActiveAudios.forEach(audio => {
          startPosition = Math.min(startPosition, audio.currentTime);
        });
        
        // Synka en sista gång innan uppspelning och logga
        console.log('--- Synkronisering före uppspelning ---');
        console.log(`Synkar till position: ${startPosition.toFixed(3)} sekunder`);
        
        updatedActiveAudios.forEach((audio) => {
          audio.currentTime = startPosition;
          console.log(`Spår synkat till: ${audio.currentTime.toFixed(3)} sekunder`);
          audio.play().catch(console.error);
        });
        
        setCurrentTime(startPosition);
        resetTruePosition(startPosition);
        console.log('-------------------------');
      }, SYNC_PAUSE_DURATION);
      
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    const activeAudios = getActiveAudioElements();
    
    setIsPlaying(false);
    
    activeAudios.forEach((audio) => {
      audio.pause();
      audio.currentTime = newTime;
    });
    
    setCurrentTime(newTime);
    resetTruePosition(newTime);
    
    // Lägg till en kort paus innan uppspelningen återupptas
    setTimeout(() => {
      // Hämta aktiva spår igen för att säkerställa att vi har alla
      const updatedActiveAudios = getActiveAudioElements();
      let startPosition = Infinity;
      
      // Hitta tidigaste position innan uppspelning återupptas
      updatedActiveAudios.forEach(audio => {
        startPosition = Math.min(startPosition, audio.currentTime);
      });
      
      // Synka en sista gång innan uppspelning och logga
      console.log('--- Synkronisering före återuppspelning ---');
      console.log(`Synkar till position: ${startPosition.toFixed(3)} sekunder`);
      
      updatedActiveAudios.forEach((audio) => {
        audio.currentTime = startPosition;
        console.log(`Spår synkat till: ${audio.currentTime.toFixed(3)} sekunder`);
        audio.play().catch(console.error);
      });
      
      setCurrentTime(startPosition);
      resetTruePosition(startPosition);
      console.log('-------------------------');
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
