export type VoicePart = "soprano" | "alto" | "tenor" | "bass" | "instrumental" | "all";

export interface Track {
  id: string;
  url: string;
  voicePart: VoicePart;
}

export interface LyricLine {
  id: string;
  text: string;
  startTime: number;
  endTime?: number;
}

export interface ChapterMarker {
  id: string;
  title: string;
  time: number;
  type: "verse" | "chorus" | "bridge" | "other";
}

export interface Song {
  id: string;
  title: string;
  tracks: Track[];
  lyrics: LyricLine[];
  choirId: string;
  chapters: ChapterMarker[];
  htmlContent?: string;
  pdf_url?: string;
  html_file_url?: string;
}

export interface Choir {
  id: string;
  name: string;
  description?: string;
}

export interface ChoirSong {
  id: string;
  choirId: string;
  songId: string;
}