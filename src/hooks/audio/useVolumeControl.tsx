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
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && value > 0) {
      if (track.voicePart === "instrumental") {
        setInstrumentalMode(true);
        setAllTrackMode(false);
        setActiveVoicePart("instrumental");
      } else {
        setAllTrackMode(true);
        setInstrumentalMode(false);
        setActiveVoicePart("all");
      }
      
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const trackPart = song.tracks.find(t => t.id === id)?.voicePart;
        if (trackPart !== track.voicePart) {
          audio.muted = true;
          audio.pause();
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && value > 0) {
      setInstrumentalMode(false);
      setAllTrackMode(false);
      setActiveVoicePart(track?.voicePart || "all");
      
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          const audio = audioRefs.current[t.id];
          audio.muted = true;
          audio.pause();
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    setVolumes(prev => ({ ...prev, [trackId]: newVolume }));
    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].volume = newVolume;
    }
  };

  return { handleVolumeChange };
};