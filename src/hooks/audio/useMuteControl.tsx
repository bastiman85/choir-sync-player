import { RefObject } from "react";
import { Song } from "@/types/song";

interface UseMuteControlProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  song: Song;
  mutedTracks: { [key: string]: boolean };
  setMutedTracks: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
  setInstrumentalMode: (value: boolean) => void;
  setAllTrackMode: (value: boolean) => void;
  setActiveVoicePart: (value: string) => void;
  synchronizeTracks: () => void;
}

export const useMuteControl = ({
  audioRefs,
  song,
  mutedTracks,
  setMutedTracks,
  setInstrumentalMode,
  setAllTrackMode,
  setActiveVoicePart,
  synchronizeTracks,
}: UseMuteControlProps) => {
  const handleMuteToggle = async (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    const newMuted = !mutedTracks[trackId];
    const audio = audioRefs.current[trackId];
    const wasPlaying = Object.values(audioRefs.current).some(a => !a.muted && !a.paused);
    
    // Find the earliest position among currently playing tracks
    let earliestPosition = Infinity;
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        earliestPosition = Math.min(earliestPosition, track.currentTime);
      }
    });
    
    // Handle voice part logic
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !newMuted) {
      setInstrumentalMode(track.voicePart === "instrumental");
      setAllTrackMode(track.voicePart === "all");
      setActiveVoicePart(track.voicePart);
      
      // Mute other tracks
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
      
      // Mute instrumental and all tracks
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          const otherAudio = audioRefs.current[t.id];
          otherAudio.muted = true;
          otherAudio.pause();
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    // Update mute state
    setMutedTracks(prev => ({ ...prev, [trackId]: newMuted }));
    if (audio) {
      audio.muted = newMuted;
      
      if (newMuted) {
        audio.pause();
      } else if (wasPlaying) {
        // Ensure we're at the earliest position before resuming
        if (earliestPosition !== Infinity) {
          // Pause all tracks momentarily
          Object.values(audioRefs.current).forEach(track => {
            if (!track.muted) {
              track.pause();
              track.currentTime = earliestPosition;
            }
          });
          
          // Set the newly unmuted track to the earliest position
          audio.currentTime = earliestPosition;
          
          // Small delay to ensure synchronization
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Resume playback for all unmuted tracks
          Object.values(audioRefs.current).forEach(track => {
            if (!track.muted) {
              track.play().catch(console.error);
            }
          });
        }
      }
    }
    
    // Final sync to ensure everything is aligned
    synchronizeTracks();
  };

  return { handleMuteToggle };
};