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
    // Only mute other tracks if the current track is "all" or "instrumental"
    if (currentTrackVoicePart === "all" || currentTrackVoicePart === "instrumental") {
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const track = song.tracks.find(t => t.id === id);
        if (track && track.voicePart !== currentTrackVoicePart) {
          audio.muted = true;
          audio.pause();
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else {
      // For voice parts, only mute "all" and "instrumental" tracks
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const track = song.tracks.find(t => t.id === id);
        if (track && (track.voicePart === "all" || track.voicePart === "instrumental")) {
          audio.muted = true;
          audio.pause();
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    }
  };

  return {
    updateTrackModes,
    muteOtherTracks,
  };
};
