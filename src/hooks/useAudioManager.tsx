
import { useRef, useEffect } from "react";
import { Song } from "@/types/song";
import { useAudioState } from "./audio/useAudioState";
import { useChapterManagement } from "./audio/useChapterManagement";
import { useTrackControls } from "./audio/useTrackControls";
import { useAudioControls } from "./audio/useAudioControls";
import { useAudioSync } from "./audio/useAudioSync";
import { useChapterLoop } from "./audio/useChapterLoop";

export const useAudioManager = (song: Song) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volumes,
    setVolumes,
    mutedTracks,
    setMutedTracks,
    instrumentalMode,
    setInstrumentalMode,
    allTrackMode,
    setAllTrackMode,
    activeVoicePart,
    setActiveVoicePart,
    autoRestartSong,
    setAutoRestartSong,
    autoRestartChapter,
    setAutoRestartChapter,
  } = useAudioState(song);

  const { currentChapter, getCurrentChapter } = useChapterManagement(currentTime, song);

  const { synchronizeTracks, resetTruePosition } = useAudioSync({
    audioRefs,
    isPlaying,
    currentTime,
    setCurrentTime,
  });

  const { handleChapterLoop } = useChapterLoop({
    audioRefs,
    currentTime,
    setCurrentTime,
    autoRestartChapter,
    song,
    getCurrentChapter,
  });

  const { togglePlayPause, handleSeek, handleTrackEnd } = useAudioControls({
    audioRefs,
    setIsPlaying,
    setCurrentTime,
    resetTruePosition,
  });

  const { handleVolumeChange, handleMuteToggle } = useTrackControls({
    audioRefs,
    song,
    volumes,
    mutedTracks,
    setVolumes,
    setMutedTracks,
    setInstrumentalMode,
    setAllTrackMode,
    setActiveVoicePart,
    synchronizeTracks,
  });

  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio) => {
      const handleEnded = () => {
        if (autoRestartSong) {
          Object.values(audioRefs.current).forEach(audio => {
            audio.currentTime = 0;
            audio.play().catch(console.error);
          });
          setCurrentTime(0);
          resetTruePosition(0);
        } else {
          handleTrackEnd();
        }
      };

      audio.addEventListener("ended", handleEnded);
      
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    });
  }, [autoRestartSong]);

  useEffect(() => {
    song.tracks.forEach((track) => {
      const audio = new Audio(track.url);
      audioRefs.current[track.id] = audio;
      
      setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
      const shouldBeMuted = track.voicePart !== "all";
      setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

      audio.volume = 1;
      audio.muted = shouldBeMuted;
      audio.preload = "auto";

      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
    });

    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [song]);

  const handleTimeUpdate = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    if (!audio.muted && !audio.paused) {
      const currentPosition = audio.currentTime;
      const chapterLooped = handleChapterLoop(currentPosition); // Spara returvärdet
      if (!chapterLooped) { // Uppdatera bara currentTime om vi inte loopade
        setCurrentTime(currentPosition);
      }
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volumes,
    mutedTracks,
    autoRestartSong,
    autoRestartChapter,
    togglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
    activeVoicePart,
    setAutoRestartSong,
    setAutoRestartChapter,
  };
};
