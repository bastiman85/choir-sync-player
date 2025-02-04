import { Song } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const getCurrentChapter = () => {
    if (!song.chapters?.length) return null;

    // Sort chapters by time to ensure we check them in order
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    // Find the last chapter that starts before the current time
    for (let i = sortedChapters.length - 1; i >= 0; i--) {
      if (currentTime >= sortedChapters[i].time) {
        return sortedChapters[i];
      }
    }
    
    // If we're before the first chapter, return the first chapter
    return sortedChapters[0];
  };

  return {
    getCurrentChapter,
  };
};