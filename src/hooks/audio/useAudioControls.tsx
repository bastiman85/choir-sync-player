import { RefObject } from "react";

interface UseAudioControlsProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  autoRestartSong: boolean;
  resetTruePosition: (time: number) => void;
}

export const useAudioControls = ({
  audioRefs,
  setIsPlaying,
  setCurrentTime,
  autoRestartSong,
  resetTruePosition,
}: UseAudioControlsProps) => {
  const togglePlayPause = (isPlaying: boolean) => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
    } else {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.play().catch(console.error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    resetTruePosition(newTime);
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });
  };

  const handleTrackEnd = () => {
    if (autoRestartSong) {
      setCurrentTime(0);
      resetTruePosition(0);
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      });
    } else {
      setIsPlaying(false);
    }
  };

  return {
    togglePlayPause,
    handleSeek,
    handleTrackEnd,
  };
};