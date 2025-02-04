import { RefObject } from "react";
import { Song } from "@/types/song";
import { useTrackState } from "./useTrackState";

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
  const { updateTrackModes, muteOtherTracks } = useTrackState({
    audioRefs,
    song,
    setInstrumentalMode,
    setAllTrackMode,
    setActiveVoicePart,
    setMutedTracks,
  });

  const handleMuteToggle = async (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newMuted = !mutedTracks[trackId];
    const audio = audioRefs.current[trackId];
    const wasPlaying = Object.values(audioRefs.current).some(a => !a.muted && !a.paused);
    
    // Find earliest position before changes
    let earliestPosition = Infinity;
    Object.values(audioRefs.current).forEach(track => {
      if (!track.muted && !track.paused) {
        earliestPosition = Math.min(earliestPosition, track.currentTime);
      }
    });
    
    if (!newMuted) {
      updateTrackModes(track);
      muteOtherTracks(track.voicePart);
    }

    // Update mute state
    setMutedTracks(prev => ({ ...prev, [trackId]: newMuted }));
    if (audio) {
      audio.muted = newMuted;
      
      if (newMuted) {
        audio.pause();
      } else if (wasPlaying && earliestPosition !== Infinity) {
        // Pause all tracks momentarily
        Object.values(audioRefs.current).forEach(track => {
          if (!track.muted) {
            track.pause();
            track.currentTime = earliestPosition;
          }
        });
        
        // Set the newly unmuted track position
        audio.currentTime = earliestPosition;
        
        // Small delay for synchronization
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Resume playback
        Object.values(audioRefs.current).forEach(track => {
          if (!track.muted) {
            track.play().catch(console.error);
          }
        });
      }
    }
    
    synchronizeTracks();
  };

  return { handleMuteToggle };
};