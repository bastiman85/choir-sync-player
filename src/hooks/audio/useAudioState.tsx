import { useState } from "react";
import { Song } from "@/types/song";

export const useAudioState = (song: Song) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({});
  const [mutedTracks, setMutedTracks] = useState<{ [key: string]: boolean }>({});
  const [instrumentalMode, setInstrumentalMode] = useState(false);
  const [allTrackMode, setAllTrackMode] = useState(false);
  const [autoRestartSong, setAutoRestartSong] = useState(false);
  const [autoRestartChapter, setAutoRestartChapter] = useState(false);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volumes,
    setVolumes,
    mutedTracks,
    setMutedTracks,
    instrumentalMode,
    setInstrumentalMode,
    allTrackMode,
    setAllTrackMode,
    autoRestartSong,
    setAutoRestartSong,
    autoRestartChapter,
    setAutoRestartChapter,
  };
};