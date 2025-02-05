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
    console.log("Checking for loop conditions...");
    const firstAudio = Object.values(audioRefs.current)[0];
    if (!firstAudio) {
      console.log("No audio elements found");
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
        
        console.log("Current chapter:", currentChapter.title);
        console.log("Chapter end time:", chapterEndTime);
        
        // If we're within 0.2 seconds of the chapter end
        if (currentPosition >= chapterEndTime - 0.2) {
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
      // If we're within 0.2 seconds of the end
      if (currentPosition >= actualDuration - 0.2) {
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

  const handleTimeUpdate = (event: Event) => {
    const audio = event.target as HTMLAudioElement;
    console.log("Time update event fired");
    
    if (!audio.muted && !audio.paused) {
      setCurrentTime(audio.currentTime);
    }
    
    checkAndHandleLooping();
  };

  useEffect(() => {
    console.log("Setting up audio elements...");
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
        console.log("Audio metadata loaded for track:", track.voicePart);
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