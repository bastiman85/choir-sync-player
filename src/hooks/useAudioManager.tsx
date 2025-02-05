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

  const { getCurrentChapter } = useChapterManagement(currentTime, song);

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

  const checkAndHandleLooping = () => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (!firstAudio) {
      return;
    }

    const actualDuration = firstAudio.duration;
    const currentPosition = firstAudio.currentTime;
    
    console.log("Current position:", currentPosition);
    console.log("Duration:", actualDuration);
    console.log("Auto restart song:", autoRestartSong);
    console.log("Auto restart chapter:", autoRestartChapter);

    // Check for chapter looping first
    if (autoRestartChapter && song.chapters?.length > 0) {
      const currentChapter = getCurrentChapter();
      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        const chapterEndTime = nextChapter ? nextChapter.time : actualDuration;
        
        // If we're at or past the chapter end time (with a small buffer)
        if (currentPosition >= chapterEndTime - 0.01) {
          console.log("Restarting chapter at time:", currentChapter.time);
          Object.values(audioRefs.current).forEach(audio => {
            audio.currentTime = currentChapter.time;
            if (!audio.muted) {
              audio.play().catch(error => console.error("Error playing audio:", error));
            }
          });
          setCurrentTime(currentChapter.time);
          return;
        }
      }
    }

    // Check for song looping
    if (autoRestartSong) {
      // If we're at or past the end of the song (with a small buffer)
      if (currentPosition >= actualDuration - 0.01) {
        console.log("Restarting song from beginning");
        Object.values(audioRefs.current).forEach(audio => {
          audio.currentTime = 0;
          if (!audio.muted) {
            audio.play().catch(error => console.error("Error playing audio:", error));
          }
        });
        setCurrentTime(0);
      }
    }
  };

  useEffect(() => {
    console.log("Auto restart chapter state changed to:", autoRestartChapter);
  }, [autoRestartChapter]);

  const handleTimeUpdate = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    
    if (!audio.muted && !audio.paused) {
      setCurrentTime(audio.currentTime);
    }
    
    // Create a closure to capture the current value of autoRestartChapter
    const checkLooping = () => {
      const firstAudio = Object.values(audioRefs.current)[0];
      if (!firstAudio) return;
      
      const currentPosition = firstAudio.currentTime;
      const actualDuration = firstAudio.duration;
      
      console.log("Checking loop with autoRestartChapter:", autoRestartChapter);
      
      if (autoRestartChapter && song.chapters?.length > 0) {
        const currentChapter = getCurrentChapter();
        if (currentChapter) {
          const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
          const chapterEndTime = nextChapter ? nextChapter.time : actualDuration;
          
          if (currentPosition >= chapterEndTime - 0.01) {
            console.log("Loop check: Restarting chapter at time:", currentChapter.time);
            Object.values(audioRefs.current).forEach(audio => {
              audio.currentTime = currentChapter.time;
              if (!audio.muted) {
                audio.play().catch(error => console.error("Error playing audio:", error));
              }
            });
            setCurrentTime(currentChapter.time);
          }
        }
      }
    };
    
    checkLooping();
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