export type VoicePart = "soprano" | "alto" | "tenor" | "bass";

export interface Track {
  id: string;
  url: string;
  voicePart: VoicePart;
}

export interface LyricLine {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}

export interface Song {
  id: string;
  title: string;
  tracks: Track[];
  lyrics: LyricLine[];
}