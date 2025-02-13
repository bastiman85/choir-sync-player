
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
  const ensureAudioReadyForPlayback = useCallback(async (audio: HTMLAudioElement) => {
    if (audio.readyState >= 2) return; // Already ready

    return new Promise<void>((resolve) => {
      const handleLoaded = () => {
        audio.removeEventListener('canplay', handleLoaded);
        resolve();
      };
      audio.addEventListener('canplay', handleLoaded);
      audio.load();
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

      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      if (unmutedTracks.length === 0) {
        console.log("No unmuted tracks to play");
        return;
      }

      // Sync all tracks to the same position
      const startTime = unmutedTracks[0].currentTime;
      unmutedTracks.forEach(audio => {
        audio.currentTime = startTime;
      });

      // Ensure all tracks are ready
      await Promise.all(unmutedTracks.map(audio => ensureAudioReadyForPlayback(audio)));

      // Play all tracks
      const playPromises = unmutedTracks.map(audio => {
        try {
          return audio.play();
        } catch (error) {
          console.error("Play error:", error);
          return Promise.reject(error);
        }
      });

      await Promise.all(playPromises);
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

    // Pause all tracks first
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

      // Ensure all tracks are ready
      await Promise.all(unmutedTracks.map(audio => ensureAudioReadyForPlayback(audio)));

      // Play all tracks
      const playPromises = unmutedTracks.map(audio => {
        try {
          return audio.play();
        } catch (error) {
          console.error("Play error after seek:", error);
          return Promise.reject(error);
        }
      });

      await Promise.all(playPromises);
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
