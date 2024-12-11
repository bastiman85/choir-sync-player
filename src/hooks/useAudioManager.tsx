import { useState, useRef, useEffect } from "react";
import { Song, Track } from "@/types/song";

export const useAudioManager = (song: Song) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({});
  const [mutedTracks, setMutedTracks] = useState<{ [key: string]: boolean }>({});
  const [instrumentalMode, setInstrumentalMode] = useState(false);
  const [allTrackMode, setAllTrackMode] = useState(false);
  const [autoRestartSong, setAutoRestartSong] = useState(false);
  const [autoRestartChapter, setAutoRestartChapter] = useState(false);

  const getCurrentChapter = () => {
    return song.chapters
      .slice()
      .reverse()
      .find(chapter => currentTime >= chapter.time);
  };

  const handleTrackEnd = () => {
    if (autoRestartSong) {
      handleSeek([0]);
      Object.values(audioRefs.current).forEach(audio => audio.play());
    } else if (autoRestartChapter && song.chapters.length > 0) {
      const currentChapter = getCurrentChapter();
      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        if (nextChapter) {
          handleSeek([nextChapter.time]);
          Object.values(audioRefs.current).forEach(audio => audio.play());
        } else {
          handleSeek([currentChapter.time]);
          Object.values(audioRefs.current).forEach(audio => audio.play());
        }
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (firstAudio) {
      setCurrentTime(firstAudio.currentTime);
    }
  };

  useEffect(() => {
    song.tracks.forEach((track) => {
      const audio = new Audio(track.url);
      audioRefs.current[track.id] = audio;
      setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
      setMutedTracks((prev) => ({ ...prev, [track.id]: false }));

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("ended", handleTrackEnd);
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleTrackEnd);
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [song]);

  const togglePlayPause = () => {
    if (isPlaying) {
      Object.values(audioRefs.current).forEach((audio) => audio.pause());
    } else {
      Object.values(audioRefs.current).forEach((audio) => audio.play());
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (trackId: string, value: number) => {
    const newVolume = value / 100;
    const track = song.tracks.find(t => t.id === trackId);
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !instrumentalMode && !allTrackMode && value > 0) {
      // Enable instrumental or all track mode
      if (track.voicePart === "instrumental") {
        setInstrumentalMode(true);
        setAllTrackMode(false);
      } else {
        setAllTrackMode(true);
        setInstrumentalMode(false);
      }
      
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const trackPart = song.tracks.find(t => t.id === id)?.voicePart;
        if (trackPart !== track.voicePart) {
          audio.volume = 0;
          setVolumes(prev => ({ ...prev, [id]: 0 }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && (instrumentalMode || allTrackMode) && value > 0) {
      // Disable instrumental and all track mode when adjusting other tracks
      setInstrumentalMode(false);
      setAllTrackMode(false);
      const instrumentalTrack = song.tracks.find(t => t.voicePart === "instrumental");
      const allTrack = song.tracks.find(t => t.voicePart === "all");
      if (instrumentalTrack) {
        audioRefs.current[instrumentalTrack.id].volume = 0;
        setVolumes(prev => ({ ...prev, [instrumentalTrack.id]: 0 }));
      }
      if (allTrack) {
        audioRefs.current[allTrack.id].volume = 0;
        setVolumes(prev => ({ ...prev, [allTrack.id]: 0 }));
      }
    }

    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    audioRefs.current[trackId].volume = newVolume;
  };

  const handleMuteToggle = (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !mutedTracks[trackId]) {
      setInstrumentalMode(false);
      setAllTrackMode(false);
    }

    setMutedTracks((prev) => {
      const newMuted = { ...prev, [trackId]: !prev[trackId] };
      audioRefs.current[trackId].muted = newMuted[trackId];
      return newMuted;
    });
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    Object.values(audioRefs.current).forEach((audio) => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volumes,
    mutedTracks,
    autoRestartSong,
    autoRestartChapter,
    setAutoRestartSong,
    setAutoRestartChapter,
    togglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
  };
};