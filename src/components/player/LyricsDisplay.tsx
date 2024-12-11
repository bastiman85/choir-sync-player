import { LyricLine } from "@/types/song";

interface LyricsDisplayProps {
  currentTime: number;
  lyrics: LyricLine[];
}

const LyricsDisplay = ({ currentTime, lyrics }: LyricsDisplayProps) => {
  const currentLyric = lyrics.find(
    (line) => currentTime >= line.startTime && currentTime <= line.endTime
  );

  return (
    <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] flex items-center justify-center">
      <p className="text-xl font-mono text-center">
        {currentLyric?.text || "♪ ♫ ♪ ♫"}
      </p>
    </div>
  );
};

export default LyricsDisplay;