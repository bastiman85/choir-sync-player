
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

  // Uppdatera tiden baserat på scrubbern istället för ljudspåren
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (isPlaying) {
        scrubberTimeRef.current += 0.05; // Uppdatera var 50:e millisekund
        setCurrentTime(scrubberTimeRef.current);
      }
    }, 50);

    return () => clearInterval(updateInterval);
  }, [isPlaying]);

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
      
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
    });

    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [song]);

  useEffect(() => {
    Object.values(audioRefs.current).forEach((audio) => {
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

      audio.addEventListener("ended", handleEnded);
      
      return () => {
        audio.removeEventListener("ended", handleEnded);
      };
    });
  }, [autoRestartSong]);

  // Uppdatera scrubberTimeRef när användaren söker manuellt
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
