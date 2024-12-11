import React, { useRef, useState, useEffect } from "react";
import { Song } from "@/types/song";
import { Button } from "./ui/button";
import TrackControls from "./player/TrackControls";
import Scrubber from "./player/Scrubber";
import LyricsDisplay from "./player/LyricsDisplay";
import ChapterMarkers from "./player/ChapterMarkers";

interface PlayerProps {
  song: Song;
}

const Player = ({ song }: PlayerProps) => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({});
  const [mutedTracks, setMutedTracks] = useState<{ [key: string]: boolean }>({});
  const [instrumentalMode, setInstrumentalMode] = useState(false);

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
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [song]);

  const handleTimeUpdate = () => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (firstAudio) {
      setCurrentTime(firstAudio.currentTime);
    }
  };

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
    
    if (track?.voicePart === "instrumental" && !instrumentalMode && value > 0) {
      // Switching to instrumental mode
      setInstrumentalMode(true);
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        const trackPart = song.tracks.find(t => t.id === id)?.voicePart;
        if (trackPart !== "instrumental") {
          audio.volume = 0;
          setVolumes(prev => ({ ...prev, [id]: 0 }));
        }
      });
    } else if (track?.voicePart !== "instrumental" && instrumentalMode && value > 0) {
      // Switching back to vocal mode
      setInstrumentalMode(false);
      const instrumentalTrack = song.tracks.find(t => t.voicePart === "instrumental");
      if (instrumentalTrack) {
        audioRefs.current[instrumentalTrack.id].volume = 0;
        setVolumes(prev => ({ ...prev, [instrumentalTrack.id]: 0 }));
      }
    }

    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    audioRefs.current[trackId].volume = newVolume;
  };

  const handleMuteToggle = (trackId: string) => {
    const track = song.tracks.find(t => t.id === trackId);
    
    if (track?.voicePart === "instrumental" && !mutedTracks[trackId]) {
      setInstrumentalMode(false);
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

  const handleChapterClick = (time: number) => {
    handleSeek([time]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{song.title}</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 space-y-4">
            {song.tracks.map((track) => (
              <TrackControls
                key={track.id}
                track={track}
                volume={volumes[track.id]}
                isMuted={mutedTracks[track.id]}
                onVolumeChange={(value) => handleVolumeChange(track.id, value)}
                onMuteToggle={() => handleMuteToggle(track.id)}
              />
            ))}
          </div>
          <div className="md:col-span-1">
            <h3 className="text-sm font-medium mb-2">Chapters</h3>
            <ChapterMarkers
              chapters={song.chapters || []}
              onChapterClick={handleChapterClick}
              currentTime={currentTime}
            />
          </div>
        </div>

        <div className="mb-6">
          <Scrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        </div>

        <Button
          onClick={togglePlayPause}
          className="w-full mb-6"
          variant="default"
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <LyricsDisplay currentTime={currentTime} lyrics={song.lyrics} />
      </div>
    </div>
  );
};

export default Player;