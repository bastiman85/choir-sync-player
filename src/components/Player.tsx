import React, { useRef, useState, useEffect } from "react";
import { Slider } from "./ui/slider";
import { Song, Track } from "@/types/song";
import { Button } from "./ui/button";
import { Volume2, VolumeX } from "lucide-react";

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

  useEffect(() => {
    song.tracks.forEach((track) => {
      const audio = new Audio(track.url);
      audioRefs.current[track.id] = audio;
      setVolumes((prev) => ({ ...prev, [track.id]: 1 }));
      setMutedTracks((prev) => ({ ...prev, [track.id]: false }));

      // Set up time update listener
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
    // Use the first track as the reference for current time
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
    setVolumes((prev) => ({ ...prev, [trackId]: newVolume }));
    audioRefs.current[trackId].volume = newVolume;
  };

  const toggleMute = (trackId: string) => {
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentLyric = song.lyrics.find(
    (line) => currentTime >= line.startTime && currentTime <= line.endTime
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{song.title}</h2>
      
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="space-y-4 mb-6">
          {song.tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-4">
              <span className="w-20 font-semibold">{track.voicePart}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleMute(track.id)}
              >
                {mutedTracks[track.id] ? <VolumeX /> : <Volume2 />}
              </Button>
              <Slider
                value={[volumes[track.id] * 100]}
                onValueChange={(value) => handleVolumeChange(track.id, value[0])}
                max={100}
                step={1}
                className="w-48"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-6">
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          onClick={togglePlayPause}
          className="w-full mb-6"
          variant="default"
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] flex items-center justify-center">
          <p className="text-xl font-mono text-center">
            {currentLyric?.text || "♪ ♫ ♪ ♫"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Player;