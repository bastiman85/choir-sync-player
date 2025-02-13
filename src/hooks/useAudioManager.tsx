
import { useRef, useEffect } from "react";
import { Song } from "@/types/song";
import { useAudioState } from "./audio/useAudioState";
import { useChapterManagement } from "./audio/useChapterManagement";
import { useTrackControls } from "./audio/useTrackControls";
import { useAudioControls } from "./audio/useAudioControls";
import { useAudioSync } from "./audio/useAudioSync";

export const useAudioManager = (song: Song) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const loadingPromises = useRef<{ [key: string]: Promise<void> }>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const objectUrlsRef = useRef<{ [key: string]: string }>({});
  
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
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const loadTrack = async (track: { id: string; url: string }) => {
      if (loadingPromises.current[track.id]) {
        return loadingPromises.current[track.id];
      }

      const loadingPromise = new Promise<void>(async (resolve) => {
        const audio = new Audio();
        
        audio.preload = "auto";
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        audio.setAttribute('preload', 'auto');
        audio.setAttribute('x-webkit-airplay', 'allow');
        audio.setAttribute('controlsList', 'nodownload');
        
        audio.src = track.url;
        
        const handleLoaded = () => {
          audioRefs.current[track.id] = audio;
          if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
          }
          audio.removeEventListener("loadedmetadata", handleLoaded);
          resolve();
        };
        
        const handleCanPlayThrough = () => {
          audio.removeEventListener('canplaythrough', handleCanPlayThrough);
          resolve();
        };
        
        audio.addEventListener("loadedmetadata", handleLoaded);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        
        audio.addEventListener("error", (e) => {
          console.error("Error loading audio:", e);
          resolve();
        });

        try {
          await audio.load();
        } catch (error) {
          console.error("Error loading audio:", error);
          resolve();
        }
      });

      loadingPromises.current[track.id] = loadingPromise;
      return loadingPromise;
    };

    const initializeTracks = async () => {
      initAudioContext();
      
      const batchSize = 2;
      for (let i = 0; i < song.tracks.length; i += batchSize) {
        const batch = song.tracks.slice(i, i + batchSize);
        await Promise.all(batch.map(track => loadTrack(track)));
        
        batch.forEach(track => {
          const audio = audioRefs.current[track.id];
          if (audio) {
            setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
            const shouldBeMuted = track.voicePart !== "all";
            setMutedTracks((prev) => ({ ...prev, [track.id]: shouldBeMuted }));

            audio.volume = 1;
            audio.muted = shouldBeMuted;
            
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.addEventListener("timeupdate", handleTimeUpdate);
            audio.addEventListener("ended", handleTrackEnd);
          }
        });
      }
    };

    initializeTracks();

    setAllTrackMode(true);
    setInstrumentalMode(false);
    setActiveVoicePart("all");

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleTrackEnd);
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      });
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      audioRefs.current = {};
      loadingPromises.current = {};
    };
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
