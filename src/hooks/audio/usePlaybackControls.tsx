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
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = 0;
        if (isPlaying) {
          audio.play();
        }
      });
    } else {
      setIsPlaying(false);
    }
  };

  const checkAndHandleLooping = () => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (!firstAudio) return;

    if (autoRestartSong && firstAudio.currentTime >= (firstAudio.duration - 0.1)) {
      handleSeek([0]);
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = 0;
        if (isPlaying) {
          audio.play();
        }
      });
      return;
    }

    if (autoRestartChapter && song.chapters?.length > 0) {
      const currentChapter = getCurrentChapter();
      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        const chapterEndTime = nextChapter ? nextChapter.time : firstAudio.duration;
        
        if (firstAudio.currentTime >= chapterEndTime - 0.1) {
          handleSeek([currentChapter.time]);
          Object.values(audioRefs.current).forEach(audio => {
            audio.currentTime = currentChapter.time;
            if (isPlaying) {
              audio.play();
            }
          });
        }
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.removeEventListener('timeupdate', checkAndHandleLooping);
      });
    } else {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.play();
        audio.addEventListener('timeupdate', checkAndHandleLooping);
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
  };

  return {
    handleTrackEnd,
    togglePlayPause,
    handleSeek,
  };
};