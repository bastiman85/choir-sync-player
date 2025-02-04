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
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      const trackPart = song.tracks.find(t => t.id === id)?.voicePart;
      if (trackPart !== currentTrackVoicePart) {
        audio.muted = true;
        audio.pause();
        setMutedTracks(prev => ({ ...prev, [id]: true }));
      }
    });
  };

  return {
    updateTrackModes,
    muteOtherTracks,
  };
};