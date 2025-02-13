
import { RefObject, useCallback, useRef } from "react";
import { Song, ChapterMarker } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const currentChapterRef = useRef<ChapterMarker | null>(null);
  const nextChapterRef = useRef<ChapterMarker | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const lastLoopCheckTimeRef = useRef<number>(performance.now());
  const loopCheckIntervalRef = useRef<number>(250);

  const getCurrentChapter = useCallback(() => {
    if (!song.chapters?.length) {
      console.log("No chapters found in song");
      return null;
    }

    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        return chapter;
      }
    }
    return null;
  }, [currentTime, song.chapters]);

  const updateChapterRefs = useCallback(() => {
    if (!song.chapters?.length) {
      currentChapterRef.current = null;
      nextChapterRef.current = null;
      return;
    }

    const now = performance.now();
    const timeSinceLastCheck = now - lastLoopCheckTimeRef.current;
    
    if (timeSinceLastCheck < loopCheckIntervalRef.current) {
      return;
    }
    
    lastLoopCheckTimeRef.current = now;
    
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        nextChapterRef.current = nextChapter || null;
        
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("\n=== Chapter State Change ===");
          console.log("Timestamp:", new Date().toISOString());
          console.log("Current time:", currentTime.toFixed(2));
          console.log("Previous chapter:", currentChapterRef.current?.title);
          console.log("New chapter:", chapter.title);
          console.log("Raw chapter data:", chapter);
          console.log("Chapter start time:", chapter.time);
          if (nextChapter) {
            console.log("Next chapter:", nextChapter.title);
            console.log("Next chapter starts at:", nextChapter.time);
          }
          console.log("=========================\n");
          
          currentChapterRef.current = chapter;
          lastUpdateTimeRef.current = now;
        }
        break;
      }
    }
  }, [currentTime, song.chapters]);

  updateChapterRefs();

  return {
    currentChapter: currentChapterRef.current,
    nextChapter: nextChapterRef.current,
    getCurrentChapter,
  };
};
