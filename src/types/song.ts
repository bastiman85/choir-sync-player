
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
  endTime?: number;
  type: "verse" | "chorus" | "bridge" | "other";
}

export interface Song {
  id: string;
  title: string;
  termin?: string;
  tracks: Track[];
  lyrics: LyricLine[];
  chapters: ChapterMarker[];
  htmlContent?: string;
  pdf_url?: string;
  slug: string;
}
