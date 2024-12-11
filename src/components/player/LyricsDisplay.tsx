import { LyricLine } from "@/types/song";

interface LyricsDisplayProps {
  currentTime: number;
  lyrics: LyricLine[];
}

const LyricsDisplay = ({ currentTime, lyrics }: LyricsDisplayProps) => {
  const getCurrentLyric = (time: number, lyrics: LyricLine[]): LyricLine | undefined => {
    const sortedLyrics = [...lyrics].sort((a, b) => a.startTime - b.startTime);
    
    for (let i = 0; i < sortedLyrics.length; i++) {
      const currentLine = sortedLyrics[i];
      const nextLine = sortedLyrics[i + 1];
      
      if (time >= currentLine.startTime && 
          (!nextLine || time < nextLine.startTime)) {
        return currentLine;
      }
    }
    
    return undefined;
  };

  const currentLyric = getCurrentLyric(currentTime, lyrics);

  return (
    <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] flex items-center justify-center">
      <p className="text-xl font-mono text-center">
        {currentLyric?.text || "♪ ♫ ♪ ♫"}
      </p>
    </div>
  );
};

export default LyricsDisplay;