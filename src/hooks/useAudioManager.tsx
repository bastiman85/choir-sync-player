
import { useRef, useEffect } from "react";
import { Song } from "@/types/song";
import { useAudioState } from "./audio/useAudioState";
import { useChapterManagement } from "./audio/useChapterManagement";
import { useTrackControls } from "./audio/useTrackControls";
import { useAudioControls } from "./audio/useAudioControls";
import { useAudioSync } from "./audio/useAudioSync";

export const useAudioManager = (song: Song) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const scrubberTimeRef = useRef<number>(0);
  const updateIntervalRef = useRef<number | null>(null);
  
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
  } = useAudioState(song);

  const { currentChapter } = useChapterManagement(currentTime, song);

  const { resetTruePosition } = useAudioSync({
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
  });

  // Optimerad tidsuppdatering med requestAnimationFrame
  useEffect(() => {
    const updateTime = () => {
      if (isPlaying) {
        scrubberTimeRef.current += 0.05;
        setCurrentTime(scrubberTimeRef.current);
        updateIntervalRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      updateIntervalRef.current = requestAnimationFrame(updateTime);
    } else if (updateIntervalRef.current) {
      cancelAnimationFrame(updateIntervalRef.current);
    }

    return () => {
      if (updateIntervalRef.current) {
        cancelAnimationFrame(updateIntervalRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const loadTrack = async (track: { id: string; url: string }) => {
      const audio = new Audio();
      audio.src = track.url;
      audio.preload = "auto";
      
      return new Promise<void>((resolve) => {
        audio.addEventListener("loadedmetadata", () => {
          audioRefs.current[track.id] = audio;
          setDuration(audio.duration);
          resolve();
        });
      });
    };

    // Ladda alla spår parallellt
    Promise.all(song.tracks.map(track => loadTrack(track))).then(() => {
      song.tracks.forEach(track => {
        const audio = audioRefs.current[track.id];
        setVolumes(prev => ({ ...prev, [track.id]: 1 }));
        const shouldBeMuted = track.voicePart !== "all";
        setMutedTracks(prev => ({ ...prev, [track.id]: shouldBeMuted }));
        audio.volume = 1;
        audio.muted = shouldBeMuted;
      });

      setAllTrackMode(true);
      setInstrumentalMode(false);
      setActiveVoicePart("all");
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [song]);

  useEffect(() => {
    const handleEnded = () => {
      if (autoRestartSong) {
        Object.values(audioRefs.current).forEach(audio => {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        });
        scrubberTimeRef.current = 0;
        setCurrentTime(0);
        resetTruePosition(0);
      } else {
        handleTrackEnd();
      }
    };

    Object.values(audioRefs.current).forEach((audio) => {
      audio.addEventListener("ended", handleEnded);
    });
    
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("ended", handleEnded);
      });
    };
  }, [autoRestartSong]);

  useEffect(() => {
    scrubberTimeRef.current = currentTime;
  }, [currentTime]);

  return {
    isPlaying,
    currentTime,
    duration,
    volumes,
    mutedTracks,
    autoRestartSong,
    togglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
    activeVoicePart,
    setAutoRestartSong,
  };
};
