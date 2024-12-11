import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Song, Track, LyricLine, VoicePart } from "@/types/song";

interface AdminSongFormProps {
  onSubmit: (song: Partial<Song>) => void;
  initialSong?: Song;
}

const AdminSongForm = ({ onSubmit, initialSong }: AdminSongFormProps) => {
  const [title, setTitle] = useState(initialSong?.title || "");
  const [tracks, setTracks] = useState<Track[]>(initialSong?.tracks || []);
  const [lyrics, setLyrics] = useState<string>(
    initialSong?.lyrics.map((l) => `${l.startTime},${l.endTime},${l.text}`).join("\n") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedLyrics: LyricLine[] = lyrics
      .split("\n")
      .filter(Boolean)
      .map((line, index) => {
        const [startTime, endTime, text] = line.split(",");
        return {
          id: index.toString(),
          startTime: parseFloat(startTime),
          endTime: parseFloat(endTime),
          text: text.trim(),
        };
      });

    onSubmit({
      title,
      tracks,
      lyrics: parsedLyrics,
    });
  };

  const handleFileUpload = (voicePart: VoicePart) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this file to a server and get back a URL
      const fakeUrl = URL.createObjectURL(file);
      const newTrack: Track = {
        voicePart,
        url: fakeUrl,
        id: Math.random().toString(),
      };
      setTracks((prev) => [...prev, newTrack]);
    }
  };

  const voiceParts: VoicePart[] = ["soprano", "alto", "tenor", "bass"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-sm font-medium mb-2">Song Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter song title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Upload Tracks</label>
        <div className="grid grid-cols-2 gap-4">
          {voiceParts.map((part) => (
            <div key={part} className="space-y-2">
              <label className="block text-sm capitalize">{part}</label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload(part)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Lyrics with Timing (format: startTime,endTime,text)
        </label>
        <Textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="0,5,First line of lyrics&#10;5,10,Second line of lyrics"
          rows={10}
        />
      </div>

      <Button type="submit">Save Song</Button>
    </form>
  );
};

export default AdminSongForm;