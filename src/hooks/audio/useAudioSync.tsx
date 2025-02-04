import { RefObject, useEffect, useRef } from "react";
import { Song } from "@/types/song";

interface UseAudioSyncProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  isPlaying: boolean;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export const useAudioSync = ({
  audioRefs,
  isPlaying,
  currentTime,
  setCurrentTime,
}: UseAudioSyncProps) => {
  const syncCheckInterval = useRef<number | null>(null);

  const synchronizeTracks = () => {
    const tracks = Object.values(audioRefs.current);
    if (tracks.length === 0) return;

    // Find the first unmuted track to use as a reference
    const referenceTrack = tracks.find(track => !track.muted) || tracks[0];
    const referenceTime = referenceTrack.currentTime;

    // Update currentTime state to match the actual playback position
    if (Math.abs(currentTime - referenceTime) > 0.1) {
      setCurrentTime(referenceTime);
    }

    // Only sync tracks that are significantly out of sync
    tracks.forEach((track) => {
      if (track !== referenceTrack) {
        const timeDiff = Math.abs(track.currentTime - referenceTime);
        if (timeDiff > 0.1) {
          track.currentTime = referenceTime;
        }
      }
    });
  };

  useEffect(() => {
    if (isPlaying && !syncCheckInterval.current) {
      syncCheckInterval.current = window.setInterval(synchronizeTracks, 1000);
    }
    return () => {
      if (syncCheckInterval.current) {
        clearInterval(syncCheckInterval.current);
        syncCheckInterval.current = null;
      }
    };
  }, [isPlaying]);

  return { synchronizeTracks };
};