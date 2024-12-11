import { RefObject } from "react";
import { Song } from "@/types/song";

interface PlaybackControlsProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  song: Song;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  setCurrentTime: (value: number) => void;
  autoRestartSong: boolean;
  autoRestartChapter: boolean;
  getCurrentChapter: () => { time: number } | null;
}

export const usePlaybackControls = ({
  audioRefs,
  song,
  isPlaying,
  setIsPlaying,
  setCurrentTime,
  autoRestartSong,
  autoRestartChapter,
  getCurrentChapter,
}: PlaybackControlsProps) => {
  const handleTrackEnd = () => {
    if (autoRestartSong) {
      handleSeek([0]);
      setIsPlaying(true);
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = 0;
        audio.play();
      });
    } else if (autoRestartChapter && song.chapters?.length > 0) {
      const currentChapter = getCurrentChapter();
      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        const seekTime = nextChapter ? nextChapter.time : currentChapter.time;
        handleSeek([seekTime]);
        setIsPlaying(true);
        Object.values(audioRefs.current).forEach(audio => {
          audio.currentTime = seekTime;
          audio.play();
        });
      }
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => audio.pause());
    } else {
      Object.values(audioRefs.current).forEach((audio) => audio.play());
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
  };

  return {
    handleTrackEnd,
    togglePlayPause,
    handleSeek,
  };
};