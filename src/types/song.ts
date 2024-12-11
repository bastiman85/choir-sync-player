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
}

export interface Choir {
  id: string;
  name: string;
  description?: string;
}