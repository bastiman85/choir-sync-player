
import { RefObject } from "react";

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
  const togglePlayPause = async (isPlaying: boolean) => {
    try {
      if (isPlaying) {
        Object.values(audioRefs.current).forEach((audio) => {
          audio.pause();
        });
        setIsPlaying(false);
      } else {
        // Samla alla spår som inte är mutade
        const unmutedTracks = Object.values(audioRefs.current).filter(
          (audio) => !audio.muted
        );

        // På iOS, försök spela upp ett spår i taget med en liten fördröjning
        for (const audio of unmutedTracks) {
          try {
            // Sätt currentTime explicit för varje spår
            audio.currentTime = unmutedTracks[0].currentTime;
            await audio.play();
            // Lägg till en kort fördröjning mellan varje spår
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error("Error playing track:", error);
          }
        }
        
        setIsPlaying(true);
      }
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
    });

    // Uppdatera position för alla spår
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });

    setCurrentTime(newTime);
    resetTruePosition(newTime);

    // Om det spelades innan seek, starta om uppspelningen
    if (wasPlaying) {
      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      // På iOS, spela upp ett spår i taget
      for (const audio of unmutedTracks) {
        try {
          await audio.play();
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          console.error("Error resuming after seek:", error);
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
