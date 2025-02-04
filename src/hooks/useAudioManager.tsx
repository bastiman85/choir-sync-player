import { useRef, useEffect } from "react";
import { Song } from "@/types/song";
import { useAudioState } from "./audio/useAudioState";
import { useChapterManagement } from "./audio/useChapterManagement";
import { useTrackControls } from "./audio/useTrackControls";
import { usePlaybackControls } from "./audio/usePlaybackControls";

export const useAudioManager = (song: Song) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const syncCheckInterval = useRef<number | null>(null);
  
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

  const { getCurrentChapter } = useChapterManagement(currentTime, song);

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
  });

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    const referenceTrack = tracks[0];
    const referenceTime = referenceTrack.currentTime;

    tracks.forEach((track) => {
      if (track !== referenceTrack) {
        const timeDiff = Math.abs(track.currentTime - referenceTime);
        // If tracks are more than 0.1 seconds out of sync, adjust them
        if (timeDiff > 0.1) {
          track.currentTime = referenceTime;
        }
      }
    });
  };

  const handleTimeUpdate = () => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (firstAudio) {
      setCurrentTime(firstAudio.currentTime);
      synchronizeTracks();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
      if (syncCheckInterval.current) {
        clearInterval(syncCheckInterval.current);
        syncCheckInterval.current = null;
      }
    } else {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.play().catch(console.error);
      });
      // Start periodic sync check when playing
      if (!syncCheckInterval.current) {
        syncCheckInterval.current = window.setInterval(synchronizeTracks, 1000);
      }
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

  const handleTrackEnd = () => {
    if (autoRestartSong) {
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      });
      setCurrentTime(0);
    } else {
      setIsPlaying(false);
      if (syncCheckInterval.current) {
        clearInterval(syncCheckInterval.current);
        syncCheckInterval.current = null;
      }
    }
  };

  useEffect(() => {
    song.tracks.forEach((track) => {
      const audio = new Audio(track.url);
      audioRefs.current[track.id] = audio;
      
      // Set initial volume and mute state
      setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
      const shouldBeMuted = track.voicePart !== "all";
      setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

      audio.volume = 1;
      audio.muted = shouldBeMuted;
      
      // Preload audio
      audio.preload = "auto";

      // Add event listeners
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("ended", handleTrackEnd);
    });

    // Set initial state for track modes
    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return () => {
      // Clean up event listeners and interval
      if (syncCheckInterval.current) {
        clearInterval(syncCheckInterval.current);
      }
      
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleTrackEnd);
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [song]);

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
    togglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
    activeVoicePart,
  };
};