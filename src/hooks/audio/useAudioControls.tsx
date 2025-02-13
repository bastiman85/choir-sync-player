
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
      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        resolve();
      };

      if (audio.readyState >= 3) {
        resolve();
      } else {
        audio.addEventListener('canplay', handleCanPlay);
      }
    });
  }, []);

  const stopAllTracks = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      try {
        audio.pause();
      } catch (error) {
        console.error("Error stopping track:", error);
      }
    });
  };

  const prepareTrackForPlay = async (audio: HTMLAudioElement, startTime: number) => {
    try {
      audio.pause();
      audio.currentTime = startTime;
      
      // För iOS: sätt en kort bit av ljudet för att "låsa upp" uppspelning
      await audio.play();
      audio.pause();
      audio.currentTime = startTime;
      
      return true;
    } catch (error) {
      console.error("Error preparing track:", error);
      return false;
    }
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

      // Förbered alla spår för uppspelning
      const preparePromises = unmutedTracks.map(audio => 
        prepareTrackForPlay(audio, startTime)
      );

      const prepareResults = await Promise.all(preparePromises);
      if (!prepareResults.every(Boolean)) {
        console.error("Some tracks failed to prepare");
        return;
      }

      // Vänta på att spåren ska vara redo
      await Promise.all(unmutedTracks.map(waitForAudioLoad));

      // Spela upp alla spår
      let playbackStarted = false;
      for (const audio of unmutedTracks) {
        try {
          await audio.play();
          playbackStarted = true;
        } catch (error) {
          console.error("Error playing track:", error);
          // Fortsätt med nästa spår även om detta misslyckades
        }
      }

      if (playbackStarted) {
        setIsPlaying(true);
      } else {
        stopAllTracks();
        setIsPlaying(false);
      }
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

      // Förbered spåren för uppspelning
      const preparePromises = unmutedTracks.map(audio => 
        prepareTrackForPlay(audio, newTime)
      );

      const prepareResults = await Promise.all(preparePromises);
      if (!prepareResults.every(Boolean)) {
        console.error("Some tracks failed to prepare after seek");
        return;
      }

      // Vänta på att spåren ska vara redo
      await Promise.all(unmutedTracks.map(waitForAudioLoad));

      // Spela upp spåren
      let playbackStarted = false;
      for (const audio of unmutedTracks) {
        try {
          await audio.play();
          playbackStarted = true;
        } catch (error) {
          console.error("Error playing track after seek:", error);
        }
      }

      if (playbackStarted) {
        setIsPlaying(true);
      } else {
        stopAllTracks();
        setIsPlaying(false);
      }
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
