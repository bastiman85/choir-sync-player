
import { RefObject, useCallback, useRef } from "react";
import { Song, ChapterMarker } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const currentChapterRef = useRef<ChapterMarker | null>(null);
  const nextChapterRef = useRef<ChapterMarker | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const lastLoopCheckTimeRef = useRef<number>(performance.now());
  const loopCheckIntervalRef = useRef<number>(50); // 50ms check interval

  const getCurrentChapter = useCallback(() => {
    if (!song.chapters?.length) {
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
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    const timeSinceLastLoopCheck = now - lastLoopCheckTimeRef.current;
    
    if (timeSinceLastLoopCheck < loopCheckIntervalRef.current) {
      return;
    }
    
    lastLoopCheckTimeRef.current = now;
    
    console.log("\n=== Chapter Update Check ===");
    console.log("Time since last update:", timeSinceLastUpdate.toFixed(2), "ms");
    console.log("Time since last loop check:", timeSinceLastLoopCheck.toFixed(2), "ms");
    console.log("Previous chapter:", currentChapterRef.current?.title);
    console.log("Current time:", currentTime.toFixed(2));
    
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        // Always update nextChapterRef even if chapter hasn't changed
        nextChapterRef.current = nextChapter || null;
        
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("\n=== Chapter State Change ===");
          console.log("Timestamp:", new Date().toISOString());
          console.log("Current time:", currentTime.toFixed(2));
          console.log("Previous chapter:", currentChapterRef.current?.title);
          console.log("New chapter:", chapter.title);
          console.log("Chapter boundaries:", chapter.time, "to", chapter.endTime || nextChapter?.time || "end");
          console.log("Next chapter:", nextChapter?.title || "none");
          console.log("Time until next chapter:", nextChapter ? (nextChapter.time - currentTime).toFixed(2) : "N/A");
          console.log("=========================\n");
          
          currentChapterRef.current = chapter;
          lastUpdateTimeRef.current = now;
        }
        break;
      }
    }
  }, [currentTime, song.chapters]);

  // Remove the shouldLoopChapter function since we're now handling looping in useChapterLoop

  // Update refs whenever time changes
  updateChapterRefs();

  return {
    currentChapter: currentChapterRef.current,
    nextChapter: nextChapterRef.current,
    getCurrentChapter,
  };
};
