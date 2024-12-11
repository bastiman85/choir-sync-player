export type VoicePart = "soprano" | "alto" | "tenor" | "bass";

export interface Track {
  id: string;
  url: string;
  voicePart: VoicePart;
}

export interface LyricLine {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

export interface Song {
  id: string;
  title: string;
  tracks: Track[];
  lyrics: LyricLine[];
  choirId: string;
}

export interface Choir {
  id: string;
  name: string;
  description?: string;
}