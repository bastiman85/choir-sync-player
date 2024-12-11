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
      if (isPlaying) {
        Object.values(audioRefs.current).forEach(audio => {
          audio.currentTime = 0;
          audio.play();
        });
      }
    } else {
      setIsPlaying(false);
    }
  };

  const checkAndHandleLooping = () => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (!firstAudio) return;

    // Check for song loop
    if (autoRestartSong && firstAudio.currentTime >= (firstAudio.duration - 0.1)) {
      handleSeek([0]);
      if (isPlaying) {
        Object.values(audioRefs.current).forEach(audio => {
          audio.currentTime = 0;
          audio.play();
        });
      }
      return; // Don't check for chapter loop if we're looping the song
    }

    // Check for chapter loop
    if (autoRestartChapter && song.chapters?.length > 0) {
      const currentChapter = getCurrentChapter();
      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        const chapterEndTime = nextChapter ? nextChapter.time : firstAudio.duration;
        
        if (firstAudio.currentTime >= chapterEndTime) {
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
    
    if (isPlaying) {
      checkAndHandleLooping();
    }
  };

  return {
    handleTrackEnd,
    togglePlayPause,
    handleSeek,
  };
};