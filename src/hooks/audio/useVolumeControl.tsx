
import { RefObject } from "react";
import { Song } from "@/types/song";

interface UseVolumeControlProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  song: Song;
  volumes: { [key: string]: number };
  setVolumes: (value: React.SetStateAction<{ [key: string]: number }>) => void;
  setInstrumentalMode: (value: boolean) => void;
  setAllTrackMode: (value: boolean) => void;
  setActiveVoicePart: (value: string) => void;
  setMutedTracks: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
}

export const useVolumeControl = ({
  audioRefs,
  song,
  volumes,
  setVolumes,
  setInstrumentalMode,
  setAllTrackMode,
  setActiveVoicePart,
  setMutedTracks,
}: UseVolumeControlProps) => {
  const handleVolumeChange = (trackId: string, value: number) => {
    const newVolume = value / 100;
    const track = song.tracks.find(t => t.id === trackId);
    
    if (!track) return;
    
    if ((track.voicePart === "instrumental" || track.voicePart === "all") && value > 0) {
      if (track.voicePart === "instrumental") {
        setInstrumentalMode(true);
        setAllTrackMode(false);
        setActiveVoicePart("instrumental");
      } else {
        setAllTrackMode(true);
        setInstrumentalMode(false);
        setActiveVoicePart("all");
      }
      
      // Kontrollera att audioRefs.current finns och att spåren existerar innan vi försöker modifiera dem
      if (audioRefs.current) {
        Object.entries(audioRefs.current).forEach(([id, audio]) => {
          if (!audio) return;  // Skippa om audio-elementet inte existerar
          
          const trackPart = song.tracks.find(t => t.id === id)?.voicePart;
          if (trackPart !== track.voicePart) {
            audio.muted = true;
            if (!audio.paused) {
              audio.pause();
            }
            setMutedTracks(prev => ({ ...prev, [id]: true }));
          }
        });
      }
    } else if ((track.voicePart !== "instrumental" && track.voicePart !== "all") && value > 0) {
      setInstrumentalMode(false);
      setAllTrackMode(false);
      setActiveVoicePart(track.voicePart);
      
      // Kontrollera att audioRefs.current finns innan vi försöker använda det
      if (audioRefs.current) {
        song.tracks.forEach(t => {
          if (t.voicePart === "instrumental" || t.voicePart === "all") {
            const audio = audioRefs.current[t.id];
            if (!audio) return;  // Skippa om audio-elementet inte existerar
            
            audio.muted = true;
            if (!audio.paused) {
              audio.pause();
            }
            setMutedTracks(prev => ({ ...prev, [t.id]: true }));
          }
        });
      }
    }

    setVolumes(prev => ({ ...prev, [trackId]: newVolume }));
    
    // Kontrollera att audio-elementet existerar innan vi sätter volymen
    const audioElement = audioRefs.current?.[trackId];
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  return { handleVolumeChange };
};
