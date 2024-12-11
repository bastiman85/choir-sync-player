import { Song } from "@/types/song";
import { RefObject } from "react";

interface TrackControlsProps {
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
}: TrackControlsProps) => {
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
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && value > 0) {
      setInstrumentalMode(false);
      setAllTrackMode(false);
      setActiveVoicePart(track?.voicePart || "all");
      
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          audioRefs.current[t.id].muted = true;
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    setVolumes(prev => ({ ...prev, [trackId]: newVolume }));
    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].volume = newVolume;
    }
  };

  const handleMuteToggle = (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    const newMuted = !mutedTracks[trackId];
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !newMuted) {
      setInstrumentalMode(track.voicePart === "instrumental");
      setAllTrackMode(track.voicePart === "all");
      setActiveVoicePart(track.voicePart);
      
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const otherTrack = song.tracks.find(t => t.id === id);
        if (otherTrack?.voicePart !== track.voicePart) {
          audio.muted = true;
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && !newMuted) {
      setInstrumentalMode(false);
      setAllTrackMode(false);
      setActiveVoicePart(track?.voicePart || "all");
      
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          audioRefs.current[t.id].muted = true;
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    setMutedTracks(prev => ({ ...prev, [trackId]: newMuted }));
    if (audioRefs.current[trackId]) {
      audioRefs.current[trackId].muted = newMuted;
    }
  };

  return {
    handleVolumeChange,
    handleMuteToggle,
  };
};