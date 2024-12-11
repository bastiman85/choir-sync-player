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
        // Find the next chapter to determine the end time of the current chapter
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        // If there's no next chapter, use the duration of the audio
        const firstAudio = Object.values(audioRefs.current)[0];
        const chapterEndTime = nextChapter ? nextChapter.time : firstAudio?.duration || 0;
        
        // If we've reached the end of the chapter, loop back to the start of the current chapter
        if (firstAudio?.currentTime >= chapterEndTime) {
          handleSeek([currentChapter.time]);
          setIsPlaying(true);
          Object.values(audioRefs.current).forEach(audio => {
            audio.currentTime = currentChapter.time;
            audio.play();
          });
        }
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