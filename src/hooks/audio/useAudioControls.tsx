
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
  const waitForAudioLoad = useCallback((audio: HTMLAudioElement) => {
    return new Promise<void>((resolve) => {
      if (audio.readyState >= 3) {
        resolve();
        return;
      }

      const handleCanPlay = () => {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        resolve();
      };

      audio.addEventListener('canplaythrough', handleCanPlay);
    });
  }, []);

  const stopAllTracks = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
    });
  };

  const resetTrack = (audio: HTMLAudioElement) => {
    const currentTime = audio.currentTime;
    audio.pause();
    audio.currentTime = currentTime;
  };

  const togglePlayPause = async (isPlaying: boolean) => {
    try {
      if (isPlaying) {
        stopAllTracks();
        setIsPlaying(false);
        return;
      }

      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      if (unmutedTracks.length === 0) {
        console.log("No unmuted tracks to play");
        return;
      }

      const startTime = unmutedTracks[0].currentTime;

      // Pausa och återställ alla spår först
      unmutedTracks.forEach(audio => {
        resetTrack(audio);
        audio.currentTime = startTime;
      });

      // Lås upp ljud för iOS
      await Promise.all(unmutedTracks.map(audio => {
        audio.load();
        return waitForAudioLoad(audio);
      }));

      // Spela upp alla spår synkroniserat
      const playPromises = unmutedTracks.map(audio => {
        const promise = audio.play();
        if (promise) {
          return promise.catch(error => {
            console.error("Track play error:", error);
            return Promise.reject(error);
          });
        }
        return Promise.resolve();
      });

      await Promise.all(playPromises).catch(error => {
        console.error("Play error:", error);
        stopAllTracks();
        throw error;
      });

      setIsPlaying(true);
    } catch (error) {
      console.error("Playback error:", error);
      stopAllTracks();
      setIsPlaying(false);
    }
  };

  const handleSeek = async (value: number[]) => {
    const newTime = value[0];
    const wasPlaying = Object.values(audioRefs.current).some(
      (audio) => !audio.paused && !audio.muted
    );

    // Pausa alla spår först
    stopAllTracks();
    
    // Sätt ny position
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });

    setCurrentTime(newTime);
    resetTruePosition(newTime);

    if (wasPlaying) {
      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      // Ladda om och vänta på spåren
      await Promise.all(unmutedTracks.map(audio => {
        audio.load();
        return waitForAudioLoad(audio);
      }));

      // Spela upp spåren synkroniserat
      const playPromises = unmutedTracks.map(audio => {
        const promise = audio.play();
        if (promise) {
          return promise.catch(error => {
            console.error("Track play error after seek:", error);
            return Promise.reject(error);
          });
        }
        return Promise.resolve();
      });

      await Promise.all(playPromises).catch(error => {
        console.error("Play error after seek:", error);
        stopAllTracks();
        throw error;
      });

      setIsPlaying(true);
    }
  };

  const handleTrackEnd = () => {
    stopAllTracks();
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
