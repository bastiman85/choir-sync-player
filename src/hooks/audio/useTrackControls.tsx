import { RefObject } from "react";
import { Song } from "@/types/song";

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
  synchronizeTracks: () => void;
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
  synchronizeTracks,
}: UseTrackControlsProps) => {
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

  const handleMuteToggle = (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    const newMuted = !mutedTracks[trackId];
    const audio = audioRefs.current[trackId];
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !newMuted) {
      setInstrumentalMode(track.voicePart === "instrumental");
      setAllTrackMode(track.voicePart === "all");
      setActiveVoicePart(track.voicePart);
      
      // First sync the track we're about to unmute with other playing tracks
      const playingTrack = Object.values(audioRefs.current).find(a => !a.paused);
      if (playingTrack) {
        audio.currentTime = playingTrack.currentTime;
      }
      
      Object.entries(audioRefs.current).forEach(([id, otherAudio]) => {
        const otherTrack = song.tracks.find(t => t.id === id);
        if (otherTrack?.voicePart !== track.voicePart) {
          otherAudio.muted = true;
          otherAudio.pause();
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && !newMuted) {
      setInstrumentalMode(false);
      setAllTrackMode(false);
      setActiveVoicePart(track?.voicePart || "all");
      
      // First sync the track we're about to unmute with other playing tracks
      const playingTrack = Object.values(audioRefs.current).find(a => !a.paused);
      if (playingTrack) {
        audio.currentTime = playingTrack.currentTime;
      }
      
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          const otherAudio = audioRefs.current[t.id];
          otherAudio.muted = true;
          otherAudio.pause();
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    setMutedTracks(prev => ({ ...prev, [trackId]: newMuted }));
    if (audio) {
      audio.muted = newMuted;
      if (newMuted) {
        audio.pause();
      } else {
        // Ensure the track is at the correct position before playing
        synchronizeTracks();
        audio.play().catch(console.error);
      }
    }
  };

  return {
    handleVolumeChange,
    handleMuteToggle,
  };
};