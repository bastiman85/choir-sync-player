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

  const handleMuteToggle = async (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    const newMuted = !mutedTracks[trackId];
    const audio = audioRefs.current[trackId];
    const wasPlaying = Object.values(audioRefs.current).some(a => !a.paused);
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !newMuted) {
      setInstrumentalMode(track.voicePart === "instrumental");
      setAllTrackMode(track.voicePart === "all");
      setActiveVoicePart(track.voicePart);
      
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
      
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          const otherAudio = audioRefs.current[t.id];
          otherAudio.muted = true;
          otherAudio.pause();
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    // Only pause all tracks momentarily when unmuting during playback
    if (wasPlaying && !newMuted) {
      // Pause all tracks
      Object.values(audioRefs.current).forEach(track => track.pause());
      
      // Wait a short moment to ensure all tracks are paused
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setMutedTracks(prev => ({ ...prev, [trackId]: newMuted }));
    if (audio) {
      audio.muted = newMuted;
      if (newMuted) {
        audio.pause();
      } else if (wasPlaying) {
        // Synchronize all tracks before resuming
        synchronizeTracks();
        
        // Resume all non-muted tracks
        Object.entries(audioRefs.current).forEach(([id, track]) => {
          if (!mutedTracks[id] && id !== trackId) {
            track.play().catch(console.error);
          }
        });
        
        // Play the newly unmuted track
        if (!newMuted) {
          audio.play().catch(console.error);
        }
      }
    }
  };

  return {
    handleVolumeChange,
    handleMuteToggle,
  };
};