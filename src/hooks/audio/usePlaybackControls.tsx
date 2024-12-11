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
    } else {
      setIsPlaying(false);
    }
  };

  const checkAndHandleChapterLoop = () => {
    if (autoRestartChapter && song.chapters?.length > 0) {
      const currentChapter = getCurrentChapter();
      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        const firstAudio = Object.values(audioRefs.current)[0];
        const chapterEndTime = nextChapter ? nextChapter.time : firstAudio?.duration || 0;
        
        if (firstAudio && firstAudio.currentTime >= chapterEndTime) {
          handleSeek([currentChapter.time]);
          if (isPlaying) {
            Object.values(audioRefs.current).forEach(audio => {
              audio.currentTime = currentChapter.time;
              audio.play();
            });
          }
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        // Add timeupdate listener when playing
        audio.removeEventListener('timeupdate', checkAndHandleChapterLoop);
      });
    } else {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.play();
        // Remove timeupdate listener when paused
        audio.addEventListener('timeupdate', checkAndHandleChapterLoop);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
    
    // Check for chapter loop immediately after seeking
    if (isPlaying) {
      checkAndHandleChapterLoop();
    }
  };

  return {
    handleTrackEnd,
    togglePlayPause,
    handleSeek,
  };
};