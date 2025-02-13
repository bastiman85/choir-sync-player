
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

      // Synkronisera alla spår till samma position
      unmutedTracks.forEach(audio => {
        audio.currentTime = startTime;
      });

      // Vänta på att alla spår är redo
      await Promise.all(unmutedTracks.map(waitForAudioLoad));

      // Spela upp alla spår samtidigt
      const playPromises = unmutedTracks.map(audio => audio.play());
      await Promise.all(playPromises);
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

    stopAllTracks();
    
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });

    setCurrentTime(newTime);
    resetTruePosition(newTime);

    if (wasPlaying) {
      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      await Promise.all(unmutedTracks.map(waitForAudioLoad));
      
      const playPromises = unmutedTracks.map(audio => audio.play());
      await Promise.all(playPromises);
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
