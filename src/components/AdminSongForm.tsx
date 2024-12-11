import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Song, LyricLine, Choir } from "@/types/song";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TrackUrlInputs from "./admin/TrackUrlInputs";
import ChapterMarkers from "./admin/ChapterMarkers";

// This would normally come from an API
const mockChoirs: Choir[] = [
  {
    id: "1",
    name: "St. Mary's Choir",
    description: "Traditional church choir"
  },
  {
    id: "2",
    name: "Community Singers",
    description: "Local community choir"
  }
];

interface AdminSongFormProps {
  onSubmit: (song: Partial<Song>) => void;
  initialSong?: Song;
}

const AdminSongForm = ({ onSubmit, initialSong }: AdminSongFormProps) => {
  const [title, setTitle] = useState(initialSong?.title || "");
  const [choirId, setChoirId] = useState(initialSong?.choirId || mockChoirs[0].id);
  const [tracks, setTracks] = useState(initialSong?.tracks || []);
  const [lyrics, setLyrics] = useState(
    initialSong?.lyrics.map((l) => `${l.startTime},${l.endTime},${l.text}`).join("\n") || ""
  );
  const [chapters, setChapters] = useState(initialSong?.chapters || []);
  const [htmlContentUrl, setHtmlContentUrl] = useState(initialSong?.htmlContent || "");

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
      choirId,
      tracks,
      lyrics: parsedLyrics,
      chapters,
      htmlContent: htmlContentUrl,
    });
  };

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
        <label className="block text-sm font-medium mb-2">Choir</label>
        <Select value={choirId} onValueChange={setChoirId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a choir" />
          </SelectTrigger>
          <SelectContent>
            {mockChoirs.map((choir) => (
              <SelectItem key={choir.id} value={choir.id}>
                {choir.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TrackUrlInputs tracks={tracks} onTracksChange={setTracks} />

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

      <div>
        <label className="block text-sm font-medium mb-2">
          HTML Content URL (optional)
          <span className="text-xs text-muted-foreground ml-2">
            (URL to HTML file with data-time attributes)
          </span>
        </label>
        <Input
          type="url"
          value={htmlContentUrl}
          onChange={(e) => setHtmlContentUrl(e.target.value)}
          placeholder="https://example.com/song-content.html"
        />
      </div>

      <ChapterMarkers chapters={chapters} onChaptersChange={setChapters} />

      <Button type="submit">Save Song</Button>
    </form>
  );
};

export default AdminSongForm;