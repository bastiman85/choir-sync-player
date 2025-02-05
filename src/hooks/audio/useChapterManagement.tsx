import { Song } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const getCurrentChapter = () => {
    if (!song.chapters?.length) return null;

    // Sort chapters by time to ensure we check them in order
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    // Find the current chapter
    for (let i = sortedChapters.length - 1; i >= 0; i--) {
      if (currentTime >= sortedChapters[i].time) {
        // Calculate the end time for this chapter
        const nextChapter = sortedChapters[i + 1];
        const chapterEndTime = nextChapter ? nextChapter.time : Infinity;
        
        return {
          ...sortedChapters[i],
          endTime: chapterEndTime
        };
      }
    }
    
    // If we're before the first chapter, return the first chapter
    const nextChapter = sortedChapters[1];
    return {
      ...sortedChapters[0],
      endTime: nextChapter ? nextChapter.time : Infinity
    };
  };

  return {
    getCurrentChapter,
  };
};