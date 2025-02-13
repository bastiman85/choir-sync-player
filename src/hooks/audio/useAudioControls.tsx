
import { RefObject, useCallback } from "react";

interface UseAudioControlsProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  resetTruePosition: (time: number) => void;
}

export const useAudioControls = ({
  audioRefs,
  setIsPlaying,
  setCurrentTime,
  resetTruePosition,
}: UseAudioControlsProps) => {
  // Hjälpfunktion för att aktivera AudioContext
  const initializeAudioContext = useCallback(async () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const context = new AudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }
      return context;
    }
    return null;
  }, []);

  const ensureAudioReadyForPlayback = useCallback(async (audio: HTMLAudioElement) => {
    return new Promise<void>((resolve) => {
      const checkState = () => {
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA eller högre
          resolve();
        } else {
          audio.addEventListener('loadeddata', () => resolve(), { once: true });
          audio.load();
        }
      };
      checkState();
    });
  }, []);

  const togglePlayPause = async (isPlaying: boolean) => {
    try {
      if (isPlaying) {
        Object.values(audioRefs.current).forEach((audio) => {
          audio.pause();
        });
        setIsPlaying(false);
        return;
      }

      // Aktivera AudioContext först
      await initializeAudioContext();

      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      if (unmutedTracks.length === 0) {
        console.log("No unmuted tracks to play");
        return;
      }

      // Synkronisera alla spår till samma startposition
      const startTime = unmutedTracks[0].currentTime;
      for (const audio of unmutedTracks) {
        audio.currentTime = startTime;
        await ensureAudioReadyForPlayback(audio);
      }

      // På iOS, gör en initial "touch" av ljudet
      const unlockAudio = async () => {
        const audio = unmutedTracks[0];
        audio.volume = 0;
        const playAttempt = audio.play();
        if (playAttempt) {
          try {
            await playAttempt;
            audio.pause();
            audio.volume = 1;
          } catch (e) {
            console.log("Unlock attempt failed:", e);
          }
        }
      };
      
      await unlockAudio();

      // Spela upp ett spår i taget med minimal fördröjning
      for (const audio of unmutedTracks) {
        try {
          const playPromise = audio.play();
          if (playPromise) {
            await playPromise;
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (error) {
          console.log("Error playing track:", error);
          // Fortsätt med nästa spår även om detta misslyckas
        }
      }

      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  };

  const handleSeek = async (value: number[]) => {
    const newTime = value[0];
    const wasPlaying = Object.values(audioRefs.current).some(
      (audio) => !audio.paused && !audio.muted
    );

    // Pausa alla spår först
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = newTime;
    });

    setCurrentTime(newTime);
    resetTruePosition(newTime);

    if (wasPlaying) {
      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      // Säkerställ att alla spår är redo
      for (const audio of unmutedTracks) {
        await ensureAudioReadyForPlayback(audio);
      }

      // Spela upp ett spår i taget
      for (const audio of unmutedTracks) {
        try {
          const playPromise = audio.play();
          if (playPromise) {
            await playPromise;
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        } catch (error) {
          console.log("Error playing track after seek:", error);
        }
      }
      
      setIsPlaying(true);
    }
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    resetTruePosition(0);
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = 0;
    });
  };

  return {
    togglePlayPause,
    handleSeek,
    handleTrackEnd,
  };
};
