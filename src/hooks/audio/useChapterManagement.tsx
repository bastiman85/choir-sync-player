import { Song, ChapterMarker } from "@/types/song";
import { useRef, useCallback } from "react";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const currentChapterRef = useRef<ChapterMarker | null>(null);
  const nextChapterRef = useRef<ChapterMarker | null>(null);

  const updateChapterRefs = useCallback(() => {
    if (!song.chapters?.length) {
      currentChapterRef.current = null;
      nextChapterRef.current = null;
      return;
    }

    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    // Find current chapter
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        // Only update refs if there's a change
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("Current chapter updated to:", chapter.title);
          currentChapterRef.current = chapter;
          nextChapterRef.current = nextChapter || null;
        }
        break;
      }
    }
  }, [currentTime, song.chapters]);

  const shouldLoopChapter = useCallback((autoRestartChapter: boolean): { shouldLoop: boolean; loopToTime: number } => {
    if (!autoRestartChapter || !currentChapterRef.current) {
      return { shouldLoop: false, loopToTime: 0 };
    }

    const currentChapter = currentChapterRef.current;
    const nextChapter = nextChapterRef.current;
    
    // Calculate chapter end time (either next chapter start or song end)
    const chapterEndTime = nextChapter ? nextChapter.time : Infinity;
    
    // Check if we're at the end of the current chapter (within 0.1 seconds)
    if (currentTime >= chapterEndTime - 0.1) {
      console.log(`Chapter end reached at ${currentTime}. Looping back to ${currentChapter.title} at ${currentChapter.time}`);
      return { shouldLoop: true, loopToTime: currentChapter.time };
    }

    return { shouldLoop: false, loopToTime: 0 };
  }, [currentTime]);

  // Update refs whenever time changes
  updateChapterRefs();

  return {
    currentChapter: currentChapterRef.current,
    nextChapter: nextChapterRef.current,
    shouldLoopChapter,
  };
};