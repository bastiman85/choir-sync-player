
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
    // Initiera Web Audio Context
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    };

    const loadTrack = async (track: { id: string; url: string }) => {
      // Återanvänd existerande promise om det finns
      if (loadingPromises.current[track.id]) {
        return loadingPromises.current[track.id];
      }

      const loadingPromise = new Promise<void>(async (resolve) => {
        const audio = new Audio();
        
        // Optimeringar för iOS Safari
        audio.preload = "auto";
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        audio.setAttribute('preload', 'auto');
        
        // iOS-specifika attribut
        audio.setAttribute('x-webkit-airplay', 'allow');
        audio.setAttribute('controlsList', 'nodownload');
        
        // Använd range requests för att förbättra laddningstiden
        const response = await fetch(track.url, {
          headers: {
            Range: 'bytes=0-',
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          audio.src = objectUrl;
        } else {
          audio.src = track.url;
        }
        
        const handleLoaded = () => {
          audioRefs.current[track.id] = audio;
          setDuration(audio.duration);
          audio.removeEventListener("loadedmetadata", handleLoaded);
          resolve();
        };
        
        audio.addEventListener("loadedmetadata", handleLoaded);
        
        // Rensa objektURL när ljudet är laddat
        audio.addEventListener('canplaythrough', () => {
          if (response.ok) {
            URL.revokeObjectURL(objectUrl);
          }
        }, { once: true });

        // Felhantering
        audio.addEventListener("error", (e) => {
          console.error("Error loading audio:", e);
          resolve();
        });

        // Starta laddningen
        audio.load();
      });

      loadingPromises.current[track.id] = loadingPromise;
      return loadingPromise;
    };

    const initializeTracks = async () => {
      const audioContext = initAudioContext();
      
      // Ladda spår i mindre grupper för att minska minnesanvändningen
      const batchSize = 2;
      for (let i = 0; i < song.tracks.length; i += batchSize) {
        const batch = song.tracks.slice(i, i + batchSize);
        await Promise.all(batch.map(track => loadTrack(track)));
        
        // Konfigurera ljudet efter laddning
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
      // Cleanup
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleTrackEnd);
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      });
      
      // Rensa objektURLs och promises
      Object.values(loadingPromises.current).forEach(promise => {
        if (promise.cancel) {
          promise.cancel();
        }
      });
      
      // Stäng AudioContext
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
