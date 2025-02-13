
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
      setCurrentTime(audio.currentTime);
    }
  };

  useEffect(() => {
    const loadTrack = async (track: { id: string; url: string }) => {
      const audio = new Audio();
      
      // Optimeringar för iOS Safari
      audio.preload = "auto";
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.setAttribute('preload', 'auto');
      
      // Lägg till specifika iOS-attribut för bättre ljudhantering
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.setAttribute('controlsList', 'nodownload');
      
      // Sätt upp buffering för bättre prestanda
      audio.autobuffer = true;
      audio.load();
      
      // Sätt src sist för att undvika race conditions
      audio.src = track.url;
      
      return new Promise<void>((resolve) => {
        const handleLoaded = () => {
          audioRefs.current[track.id] = audio;
          setDuration(audio.duration);
          audio.removeEventListener("loadedmetadata", handleLoaded);
          resolve();
        };
        
        const handleCanPlayThrough = () => {
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          resolve();
        };
        
        audio.addEventListener("loadedmetadata", handleLoaded);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        
        // Lägg till felhantering
        audio.addEventListener("error", (e) => {
          console.error("Error loading audio:", e);
          resolve();
        });
      });
    };

    const initializeTracks = async () => {
      // Ladda spår sekventiellt för att minska belastningen
      for (const track of song.tracks) {
        await loadTrack(track);
        
        const audio = audioRefs.current[track.id];
        if (audio) {
          // Sätt initial volym och mute-tillstånd
          setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
          const shouldBeMuted = track.voicePart !== "all";
          setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

          audio.volume = 1;
          audio.muted = shouldBeMuted;
          
          // Lägg till eventlyssnare
          audio.removeEventListener("timeupdate", handleTimeUpdate);
          audio.addEventListener("timeupdate", handleTimeUpdate);
          audio.addEventListener("ended", handleTrackEnd);
          
          // Förbered för iOS-uppspelning
          try {
            await audio.load();
          } catch (error) {
            console.error("Error preloading audio:", error);
          }
        }
      }
    };

    initializeTracks();

    // Sätt initial state för spårlägen
    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleTrackEnd);
        audio.pause();
        audio.currentTime = 0;
        audio.src = ''; // Rensa src för att frigöra minne
      });
      audioRefs.current = {};
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
