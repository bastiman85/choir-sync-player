
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

        if (unmutedTracks.length === 0) {
          console.log("No unmuted tracks to play");
          return;
        }

        // Synkronisera alla spår till samma startposition
        const startTime = unmutedTracks[0].currentTime;
        unmutedTracks.forEach(audio => {
          audio.currentTime = startTime;
        });

        // För iOS, skapa en enkel use gesture genom att starta och stoppa direkt
        try {
          const tempAudio = unmutedTracks[0];
          await tempAudio.play();
          tempAudio.pause();
        } catch (error) {
          console.log("Initial play-pause cycle failed:", error);
        }

        // Försök spela upp alla spår samtidigt
        let playPromises = unmutedTracks.map(audio => {
          // Säkerställ att audio är i rätt läge för uppspelning
          if (audio.paused) {
            return audio.play().catch(error => {
              console.log("Error playing track:", error);
              return Promise.reject(error);
            });
          }
          return Promise.resolve();
        });

        try {
          await Promise.all(playPromises);
          setIsPlaying(true);
        } catch (error) {
          console.log("Error during parallel playback:", error);
          // Om parallell uppspelning misslyckas, försök sekventiellt
          for (const audio of unmutedTracks) {
            try {
              if (audio.paused) {
                await audio.play();
                await new Promise(resolve => setTimeout(resolve, 20));
              }
            } catch (innerError) {
              console.log("Sequential playback error:", innerError);
            }
          }
          setIsPlaying(true);
        }
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
      audio.currentTime = newTime;
    });

    setCurrentTime(newTime);
    resetTruePosition(newTime);

    if (wasPlaying) {
      const unmutedTracks = Object.values(audioRefs.current).filter(
        (audio) => !audio.muted
      );

      // Försök spela upp alla spår samtidigt
      let playPromises = unmutedTracks.map(audio => {
        if (audio.paused) {
          return audio.play().catch(error => {
            console.log("Error playing track after seek:", error);
            return Promise.reject(error);
          });
        }
        return Promise.resolve();
      });

      try {
        await Promise.all(playPromises);
        setIsPlaying(true);
      } catch (error) {
        console.log("Error during parallel playback after seek:", error);
        // Om parallell uppspelning misslyckas, försök sekventiellt
        for (const audio of unmutedTracks) {
          try {
            if (audio.paused) {
              await audio.play();
              await new Promise(resolve => setTimeout(resolve, 20));
            }
          } catch (innerError) {
            console.log("Sequential playback error after seek:", innerError);
          }
        }
        setIsPlaying(true);
      }
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
