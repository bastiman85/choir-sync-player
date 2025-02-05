import { useRef, useEffect } from "react";
import { Song } from "@/types/song";
import { useAudioState } from "./audio/useAudioState";
import { useChapterManagement } from "./audio/useChapterManagement";
import { useTrackControls } from "./audio/useTrackControls";
import { useAudioControls } from "./audio/useAudioControls";
import { useAudioSync } from "./audio/useAudioSync";

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
    autoRestartSong,
    setAutoRestartSong,
    autoRestartChapter,
    setAutoRestartChapter,
    activeVoicePart,
    setActiveVoicePart,
  } = useAudioState(song);

  const { currentChapter, nextChapter, shouldLoopChapter } = useChapterManagement(currentTime, song);

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
    autoRestartSong,
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

  const handleTimeUpdate = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    
    if (!audio.muted && !audio.paused) {
      const currentPosition = audio.currentTime;
      setCurrentTime(currentPosition);

      // Handle song looping
      if (autoRestartSong && currentPosition >= audio.duration - 0.1) {
        console.log("\n=== Song Loop Check ===");
        console.log("Song end reached, looping entire song");
        console.log("Current position:", currentPosition.toFixed(2));
        console.log("Audio duration:", audio.duration.toFixed(2));
        Object.values(audioRefs.current).forEach(track => {
          track.currentTime = 0;
          if (!track.muted) {
            track.play().catch(error => console.error("Error playing audio:", error));
          }
        });
        setCurrentTime(0);
      }

      // Handle chapter looping with improved management
      if (autoRestartChapter && song.chapters?.length > 0) {
        console.log("\n=== Chapter Loop Management ===");
        console.log("Auto restart chapter is enabled");
        const { shouldLoop, loopToTime } = shouldLoopChapter(autoRestartChapter);
        
        if (shouldLoop) {
          console.log("Loop triggered - Resetting to time:", loopToTime);
          Object.values(audioRefs.current).forEach(track => {
            track.currentTime = loopToTime;
            if (!track.muted) {
              track.play().catch(error => console.error("Error playing audio:", error));
            }
          });
          setCurrentTime(loopToTime);
          console.log("Loop complete - New current time:", loopToTime);
        } else {
          console.log("No loop needed at current time:", currentPosition.toFixed(2));
        }
        console.log("============================\n");
      }
    }
  };

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
      
      audio.addEventListener("ended", handleTrackEnd);
    });

    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return () => {
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
    togglePlayPause: () => togglePlayPause(isPlaying),
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
    activeVoicePart,
  };
};