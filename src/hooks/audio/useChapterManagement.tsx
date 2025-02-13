
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
      return null;
    }

    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        // Sätt endTime baserat på nästa kapitel eller sångens slut
        const chapterWithEndTime = {
          ...chapter,
          endTime: nextChapter ? nextChapter.time : undefined
        };
        return chapterWithEndTime;
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
        // Always update nextChapterRef even if chapter hasn't changed
        nextChapterRef.current = nextChapter || null;
        
        // Sätt endTime baserat på nästa kapitel
        const chapterWithEndTime = {
          ...chapter,
          endTime: nextChapter ? nextChapter.time : undefined
        };
        
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("\n=== Chapter State Change ===");
          console.log("Timestamp:", new Date().toISOString());
          console.log("Current time:", currentTime.toFixed(2));
          console.log("Previous chapter:", currentChapterRef.current?.title);
          console.log("New chapter:", chapter.title);
          console.log("Raw chapter data:", chapterWithEndTime);
          console.log("Chapter boundaries:", chapter.time, "to", chapterWithEndTime.endTime || "no end time set");
          if (nextChapter) {
            console.log("Next chapter:", nextChapter.title);
            console.log("Next chapter starts at:", nextChapter.time);
          }
          console.log("=========================\n");
          
          currentChapterRef.current = chapterWithEndTime;
          lastUpdateTimeRef.current = now;
        } else {
          // Logga bara var 2:a sekund om kapitlet inte ändrats
          const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
          if (timeSinceLastUpdate > 2000) {
            console.log("\n=== Chapter Update Check ===");
            console.log("Current time:", currentTime.toFixed(2));
            console.log("Current chapter:", chapter.title);
            console.log("Raw chapter data:", chapterWithEndTime);
            if (chapterWithEndTime.endTime) {
              console.log("Time until chapter end:", (chapterWithEndTime.endTime - currentTime).toFixed(2));
            }
            if (nextChapter) {
              console.log("Next chapter starts at:", nextChapter.time);
            }
            lastUpdateTimeRef.current = now;
          }
        }
        break;
      }
    }
  }, [currentTime, song.chapters]);

  // Update refs whenever time changes
  updateChapterRefs();

  return {
    currentChapter: currentChapterRef.current,
    nextChapter: nextChapterRef.current,
    getCurrentChapter,
  };
};
