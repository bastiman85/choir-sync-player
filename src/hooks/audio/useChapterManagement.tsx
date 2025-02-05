import { Song } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const getCurrentChapter = () => {
    if (!song.chapters?.length) return null;

    // Sort chapters by time to ensure we check them in order
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    // Find the current chapter by checking if currentTime is between this chapter's start and the next chapter's start
    for (let i = 0; i < sortedChapters.length; i++) {
      const currentChapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];
      
      // If this is the last chapter, use the song duration as the end time
      const chapterEndTime = nextChapter ? nextChapter.time : Infinity;
      
      // Check if currentTime falls within this chapter's bounds
      if (currentTime >= currentChapter.time && currentTime < chapterEndTime) {
        console.log(`Found chapter: ${currentChapter.title} (${currentChapter.time} - ${chapterEndTime})`);
        return {
          ...currentChapter,
          endTime: chapterEndTime
        };
      }
    }
    
    // If we're before the first chapter, return null
    if (currentTime < sortedChapters[0].time) {
      return null;
    }
    
    // If we're past all chapters, return the last chapter
    const lastChapter = sortedChapters[sortedChapters.length - 1];
    return {
      ...lastChapter,
      endTime: Infinity
    };
  };

  return {
    getCurrentChapter,
  };
};