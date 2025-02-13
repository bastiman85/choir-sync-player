
import { useRef, useEffect } from "react";
import { Song } from "@/types/song";
import { useAudioState } from "./audio/useAudioState";
import { useChapterManagement } from "./audio/useChapterManagement";
import { useTrackControls } from "./audio/useTrackControls";
import { useAudioControls } from "./audio/useAudioControls";
import { useAudioSync } from "./audio/useAudioSync";
import { useAudioInitialization } from "./audio/useAudioInitialization";

export const useAudioManager = (song: Song) => {
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
    autoRestartSong,
    setAutoRestartSong,
    autoRestartChapter,
    setAutoRestartChapter,
    activeVoicePart,
    setActiveVoicePart,
  } = useAudioState(song);

  const handleTimeUpdate = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    if (!audio.muted && !audio.paused) {
      setCurrentTime(audio.currentTime);
    }
  };

  const { getCurrentChapter } = useChapterManagement(currentTime, song);

  const {
    audioRefs,
    initializeTracks,
    cleanup,
  } = useAudioInitialization({
    song,
    setVolumes,
    setMutedTracks,
    setDuration,
    handleTimeUpdate,
    handleTrackEnd: () => handleTrackEnd(),
  });

  const { synchronizeTracks, resetTruePosition } = useAudioSync({
    audioRefs,
    isPlaying,
    currentTime,
    setCurrentTime,
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
    initializeTracks();

    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return cleanup;
  }, [song]);

  const handleTogglePlayPause = () => {
    togglePlayPause(isPlaying);
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volumes,
    mutedTracks,
    autoRestartSong,
    autoRestartChapter,
    setAutoRestartSong,
    setAutoRestartChapter,
    togglePlayPause: handleTogglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
    activeVoicePart,
  };
};
