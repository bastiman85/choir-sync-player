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
      
      // Set initial volume to 0 for "all" and "instrumental" tracks
      const initialVolume = track.voicePart === "all" || track.voicePart === "instrumental" ? 0 : 1;
      setVolumes((prev) => ({ ...prev, [track.id]: initialVolume }));
      
      // Set initial mute state for "all" and "instrumental" tracks
      const initialMute = track.voicePart === "all" || track.voicePart === "instrumental";
      setMutedTracks((prev) => ({ ...prev, [track.id]: initialMute }));

      audio.volume = initialVolume;
      audio.muted = initialMute;

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
      
      // Mute all other tracks
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const trackPart = song.tracks.find(t => t.id === id)?.voicePart;
        if (trackPart !== track.voicePart) {
          audio.volume = 0;
          audio.muted = true;
          setVolumes(prev => ({ ...prev, [id]: 0 }));
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && (instrumentalMode || allTrackMode) && value > 0) {
      // Disable instrumental and all track mode when adjusting other tracks
      setInstrumentalMode(false);
      setAllTrackMode(false);
      
      // Mute instrumental and all tracks
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          audioRefs.current[t.id].volume = 0;
          audioRefs.current[t.id].muted = true;
          setVolumes(prev => ({ ...prev, [t.id]: 0 }));
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    audioRefs.current[trackId].volume = newVolume;
  };

  const handleMuteToggle = (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    const newMuted = !mutedTracks[trackId];
    
    if ((track?.voicePart === "instrumental" || track?.voicePart === "all") && !newMuted) {
      // When unmuting instrumental or all track, mute all other tracks
      setInstrumentalMode(track.voicePart === "instrumental");
      setAllTrackMode(track.voicePart === "all");
      
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const otherTrack = song.tracks.find(t => t.id === id);
        if (otherTrack?.voicePart !== track.voicePart) {
          audio.muted = true;
          setMutedTracks(prev => ({ ...prev, [id]: true }));
        }
      });
    } else if ((track?.voicePart !== "instrumental" && track?.voicePart !== "all") && !newMuted) {
      // When unmuting other tracks, mute instrumental and all tracks
      setInstrumentalMode(false);
      setAllTrackMode(false);
      
      song.tracks.forEach(t => {
        if (t.voicePart === "instrumental" || t.voicePart === "all") {
          audioRefs.current[t.id].muted = true;
          setMutedTracks(prev => ({ ...prev, [t.id]: true }));
        }
      });
    }

    setMutedTracks((prev) => ({ ...prev, [trackId]: newMuted }));
    audioRefs.current[trackId].muted = newMuted;
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