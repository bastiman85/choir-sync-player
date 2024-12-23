import { LyricLine } from "@/types/song";

interface PlainLyricsViewProps {
  currentLyric?: LyricLine;
}

export const PlainLyricsView = ({ currentLyric }: PlainLyricsViewProps) => {
  return (
    <p className="text-xl font-mono text-center">
      {currentLyric?.text || "♪ ♫ ♪ ♫"}
    </p>
  );
};