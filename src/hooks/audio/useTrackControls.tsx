
import { RefObject } from "react";
import { Song } from "@/types/song";
import { useVolumeControl } from "./useVolumeControl";
import { useMuteControl } from "./useMuteControl";

interface UseTrackControlsProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  song: Song;
  volumes: { [key: string]: number };
  mutedTracks: { [key: string]: boolean };
  setVolumes: (value: React.SetStateAction<{ [key: string]: number }>) => void;
  setMutedTracks: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
  setInstrumentalMode: (value: boolean) => void;
  setAllTrackMode: (value: boolean) => void;
  setActiveVoicePart: (value: string) => void;
}

export const useTrackControls = ({
  audioRefs,
  song,
  volumes,
  mutedTracks,
  setVolumes,
  setMutedTracks,
  setInstrumentalMode,
  setAllTrackMode,
  setActiveVoicePart,
}: UseTrackControlsProps) => {
  const { handleVolumeChange } = useVolumeControl({
    audioRefs,
    song,
    volumes,
    setVolumes,
    setInstrumentalMode,
    setAllTrackMode,
    setActiveVoicePart,
    setMutedTracks,
  });

  const { handleMuteToggle } = useMuteControl({
    audioRefs,
    song,
    mutedTracks,
    setMutedTracks,
    setInstrumentalMode,
    setAllTrackMode,
    setActiveVoicePart,
  });

  return {
    handleVolumeChange,
    handleMuteToggle,
  };
};
