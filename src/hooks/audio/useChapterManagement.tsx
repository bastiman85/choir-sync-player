import { Song } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const getCurrentChapter = () => {
    if (!song.chapters?.length) {
      console.log("No chapters found in song");
      return null;
    }

    // Sort chapters by time to ensure we check them in order
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    console.log("Current time:", currentTime);
    console.log("Available chapters:", sortedChapters.map(c => `${c.title} (starts at ${c.time})`));
    
    // Find the current chapter by checking if currentTime is between this chapter's start and the next chapter's start
    for (let i = 0; i < sortedChapters.length; i++) {
      const currentChapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];
      
      // If this is the last chapter, use the song duration as the end time
      const chapterEndTime = nextChapter ? nextChapter.time : Infinity;
      
      // Check if currentTime falls within this chapter's bounds
      if (currentTime >= currentChapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        console.log(`Found current chapter: ${currentChapter.title}`);
        console.log(`Chapter start time: ${currentChapter.time}`);
        console.log(`Chapter end time: ${chapterEndTime}`);
        return currentChapter;
      }
    }
    
    // If we haven't found a matching chapter, determine why
    if (currentTime < sortedChapters[0].time) {
      console.log(`Current time (${currentTime}) is before first chapter (${sortedChapters[0].time})`);
      return null;
    }
    
    // If we're past all chapters but not at the end, return the last chapter
    const lastChapter = sortedChapters[sortedChapters.length - 1];
    console.log(`Past all chapter starts, returning last chapter: ${lastChapter.title}`);
    return lastChapter;
  };

  return {
    getCurrentChapter,
  };
};