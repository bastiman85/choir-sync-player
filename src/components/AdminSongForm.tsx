import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Song, Track, LyricLine, VoicePart, Choir, ChapterMarker } from "@/types/song";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

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
  const [tracks, setTracks] = useState<Track[]>(initialSong?.tracks || []);
  const [lyrics, setLyrics] = useState<string>(
    initialSong?.lyrics.map((l) => `${l.startTime},${l.endTime},${l.text}`).join("\n") || ""
  );
  const [chapters, setChapters] = useState<ChapterMarker[]>(
    initialSong?.chapters || []
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
      choirId,
      tracks,
      lyrics: parsedLyrics,
      chapters,
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

  const addChapter = () => {
    const newChapter: ChapterMarker = {
      id: Math.random().toString(),
      title: "",
      time: 0,
      type: "verse",
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (id: string, field: keyof ChapterMarker, value: string | number) => {
    setChapters(chapters.map(chapter => 
      chapter.id === id ? { ...chapter, [field]: value } : chapter
    ));
  };

  const removeChapter = (id: string) => {
    setChapters(chapters.filter(chapter => chapter.id !== id));
  };

  const voiceParts: VoicePart[] = ["soprano", "alto", "tenor", "bass"];
  const chapterTypes = ["verse", "chorus", "bridge", "other"];

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

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium">Chapter Markers</label>
          <Button type="button" onClick={addChapter} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Chapter
          </Button>
        </div>
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="flex gap-4 items-center">
              <Input
                placeholder="Chapter title"
                value={chapter.title}
                onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Time (seconds)"
                value={chapter.time}
                onChange={(e) => updateChapter(chapter.id, "time", parseFloat(e.target.value))}
                className="w-32"
              />
              <Select 
                value={chapter.type} 
                onValueChange={(value) => updateChapter(chapter.id, "type", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {chapterTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => removeChapter(chapter.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit">Save Song</Button>
    </form>
  );
};

export default AdminSongForm;
