
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
          nextChapterRef.current = nextChapter || null;
          lastUpdateTimeRef.current = now;
        }
        break;
      }
    }
  }, [currentTime, song.chapters]);

  const shouldLoopChapter = useCallback((autoRestartChapter: boolean): { shouldLoop: boolean; loopToTime: number } => {
    if (!autoRestartChapter || !currentChapterRef.current) {
      return { shouldLoop: false, loopToTime: 0 };
    }

    const now = performance.now();
    lastLoopCheckTimeRef.current = now;
    
    const currentChapter = currentChapterRef.current;
    const nextChapter = nextChapterRef.current;
    
    // Get first audio element to check total duration
    const firstAudio = document.querySelector('audio');
    const totalDuration = firstAudio?.duration || Infinity;
    
    // If this is the last chapter, use audio duration as end time
    const chapterEndTime = nextChapter ? nextChapter.time : totalDuration;
    const threshold = nextChapter ? 0.2 : 0.5; // Larger threshold for last chapter
    
    console.log("\n=== Detailed Loop Check ===");
    console.log("Current chapter:", currentChapter.title);
    console.log("Current time:", currentTime.toFixed(2));
    console.log("Chapter start time:", currentChapter.time);
    console.log("Next chapter:", nextChapter?.title || "end of song");
    console.log("Next chapter time:", nextChapter?.time || "N/A");
    console.log("Chapter end time:", chapterEndTime);
    console.log("Time until chapter end:", (chapterEndTime - currentTime).toFixed(2));
    console.log("Loop threshold:", (chapterEndTime - threshold).toFixed(2));
    console.log("Is last chapter:", !nextChapter ? "yes" : "no");
    console.log("Using threshold:", threshold);

    const shouldLoop = currentTime >= chapterEndTime - threshold;
    
    if (shouldLoop) {
      console.log("\n!!! LOOP DECISION !!!");
      console.log("Timestamp:", new Date().toISOString());
      console.log(`Chapter end reached at ${currentTime.toFixed(2)}`);
      console.log(`Looping back to ${currentChapter.title} at ${currentChapter.time}`);
      console.log("!!!!!!!!!!!!!!!!!!!!!\n");
    }

    return { shouldLoop, loopToTime: currentChapter.time };
  }, [currentTime]);

  // Update refs whenever time changes
  updateChapterRefs();

  return {
    currentChapter: currentChapterRef.current,
    nextChapter: nextChapterRef.current,
    shouldLoopChapter,
    getCurrentChapter,
  };
};
