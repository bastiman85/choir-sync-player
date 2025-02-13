
import { RefObject } from "react";
import { Song } from "@/types/song";

interface UseTrackStateProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  song: Song;
  setInstrumentalMode: (value: boolean) => void;
  setAllTrackMode: (value: boolean) => void;
  setActiveVoicePart: (value: string) => void;
  setMutedTracks: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
}

export const useTrackState = ({
  audioRefs,
  song,
  setInstrumentalMode,
  setAllTrackMode,
  setActiveVoicePart,
  setMutedTracks,
}: UseTrackStateProps) => {
  const updateTrackModes = (track: { voicePart: string }) => {
    if (track.voicePart === "instrumental") {
      setInstrumentalMode(true);
      setAllTrackMode(false);
      setActiveVoicePart("instrumental");
    } else if (track.voicePart === "all") {
      setAllTrackMode(true);
      setInstrumentalMode(false);
      setActiveVoicePart("all");
    } else {
      setInstrumentalMode(false);
      setAllTrackMode(false);
      setActiveVoicePart(track.voicePart);
    }
  };

  const muteOtherTracks = (currentTrackVoicePart: string) => {
    // Samla alla tracks som ska mutas i en array först
    const tracksToMute = Object.entries(audioRefs.current).filter(([id]) => {
      const track = song.tracks.find(t => t.id === id);
      if (!track) return false;

      if (currentTrackVoicePart === "all" || currentTrackVoicePart === "instrumental") {
        // Om current track är "all" eller "instrumental", muta alla andra tracks
        return track.voicePart !== currentTrackVoicePart;
      } else {
        // För röstdelar, muta bara "all" och "instrumental" tracks
        return track.voicePart === "all" || track.voicePart === "instrumental";
      }
    });

    // Uppdatera muted state för alla tracks på en gång
    const updates: { [key: string]: boolean } = {};
    tracksToMute.forEach(([id]) => {
      updates[id] = true;
    });

    // Gör en enda uppdatering av state
    setMutedTracks(prev => ({ ...prev, ...updates }));

    // Pausa och muta alla tracks som ska mutas
    tracksToMute.forEach(([, audio]) => {
      audio.pause();
      audio.muted = true;
    });
  };

  return {
    updateTrackModes,
    muteOtherTracks,
  };
};
