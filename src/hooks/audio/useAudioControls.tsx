
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
  const togglePlayPause = (isPlaying: boolean) => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
      setIsPlaying(false);
    } else {
      // Logga startpositioner för alla spår
      console.log('--- Spår startpositioner ---');
      Object.entries(audioRefs.current).forEach(([trackId, audio]) => {
        console.log(`Spår ${trackId}: ${audio.currentTime.toFixed(3)} sekunder`);
      });
      console.log('-------------------------');

      Object.values(audioRefs.current).forEach((audio) => {
        audio.play().catch(console.error);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
    resetTruePosition(newTime);
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
