
import { RefObject, useCallback, useRef } from "react";
import { Song, ChapterMarker } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const currentChapterRef = useRef<ChapterMarker | null>(null);
  const nextChapterRef = useRef<ChapterMarker | null>(null);
  const lastUpdateTimeRef = useRef<number>(performance.now());
  const lastLoopCheckTimeRef = useRef<number>(performance.now());
  const loopCheckIntervalRef = useRef<number>(250); // Öka intervallet till 250ms för att minska antalet uppdateringar

  const getCurrentChapter = useCallback(() => {
    if (!song.chapters?.length) {
      return null;
    }

    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        // Sätt endTime baserat på nästa kapitel om det inte finns ett explicit endTime
        return {
          ...chapter,
          endTime: chapter.endTime || nextChapter?.time
        };
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
        
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("\n=== Chapter State Change ===");
          console.log("Timestamp:", new Date().toISOString());
          console.log("Current time:", currentTime.toFixed(2));
          console.log("Previous chapter:", currentChapterRef.current?.title);
          console.log("New chapter:", chapter.title);
          console.log("Chapter boundaries:", chapter.time, "to", nextChapter?.time || "end");
          console.log("Next chapter:", nextChapter?.title || "none");
          console.log("Time until next chapter:", nextChapter ? (nextChapter.time - currentTime).toFixed(2) : "N/A");
          console.log("=========================\n");
          
          currentChapterRef.current = chapter;
          lastUpdateTimeRef.current = now;
        } else {
          // Logga bara var 2:a sekund om kapitlet inte ändrats
          const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
          if (timeSinceLastUpdate > 2000) {
            console.log("\n=== Chapter Update Check ===");
            console.log("Current time:", currentTime.toFixed(2));
            console.log("Current chapter:", chapter.title);
            console.log("Time until next chapter:", nextChapter ? (nextChapter.time - currentTime).toFixed(2) : "N/A");
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
