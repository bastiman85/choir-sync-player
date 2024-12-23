import { LyricLine } from "@/types/song";

export const getCurrentLyric = (time: number, lyrics: LyricLine[]): LyricLine | undefined => {
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