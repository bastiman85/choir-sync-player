import React, { useState } from "react";
import { Button } from "./ui/button";
import { Song, LyricLine, Choir } from "@/types/song";
import TrackUrlInputs from "./admin/TrackUrlInputs";
import ChapterMarkers from "./admin/ChapterMarkers";
import SongBasicDetails from "./admin/SongBasicDetails";
import HtmlContentInput from "./admin/HtmlContentInput";
import LyricsInput from "./admin/LyricsInput";

interface AdminSongFormProps {
  onSubmit: (song: Partial<Song>) => void;
  initialSong?: Song;
}

const AdminSongForm = ({ onSubmit, initialSong }: AdminSongFormProps) => {
  const [title, setTitle] = useState(initialSong?.title || "");
  const [choirId, setChoirId] = useState(initialSong?.choirId || "");
  const [pdfUrl, setPdfUrl] = useState(initialSong?.pdf_url || "");
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
      pdf_url: pdfUrl,
      tracks,
      lyrics: parsedLyrics,
      chapters,
      htmlContent: htmlContentUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <SongBasicDetails
        title={title}
        onTitleChange={setTitle}
        choirId={choirId}
        onChoirIdChange={setChoirId}
        pdfUrl={pdfUrl}
        onPdfUrlChange={setPdfUrl}
      />

      <TrackUrlInputs tracks={tracks} onTracksChange={setTracks} />

      <LyricsInput lyrics={lyrics} onLyricsChange={setLyrics} />

      <HtmlContentInput
        htmlContentUrl={htmlContentUrl}
        onHtmlContentUrlChange={setHtmlContentUrl}
      />

      <ChapterMarkers chapters={chapters} onChaptersChange={setChapters} />

      <Button type="submit">Save Song</Button>
    </form>
  );
};

export default AdminSongForm;