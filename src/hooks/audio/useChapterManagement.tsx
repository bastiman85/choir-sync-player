import { Song, ChapterMarker } from "@/types/song";
import { useRef, useCallback } from "react";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const currentChapterRef = useRef<ChapterMarker | null>(null);
  const nextChapterRef = useRef<ChapterMarker | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const updateChapterRefs = useCallback(() => {
    if (!song.chapters?.length) {
      currentChapterRef.current = null;
      nextChapterRef.current = null;
      return;
    }

    const now = performance.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    console.log("\n=== Chapter Update Check ===");
    console.log("Time since last update:", timeSinceLastUpdate.toFixed(2), "ms");
    console.log("Previous chapter:", currentChapterRef.current?.title);
    
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    // Find current chapter
    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time)) {
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("\n=== Chapter State Change ===");
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
      console.log("\n--- Loop Check Skipped ---");
      console.log("Reason:", !autoRestartChapter ? "auto-restart is off" : "no current chapter");
      console.log("Auto restart chapter:", autoRestartChapter);
      console.log("Current chapter exists:", !!currentChapterRef.current);
      console.log("-----------------------\n");
      return { shouldLoop: false, loopToTime: 0 };
    }

    const currentChapter = currentChapterRef.current;
    const nextChapter = nextChapterRef.current;
    
    console.log("\n=== Detailed Loop Check ===");
    console.log("Current chapter:", currentChapter.title);
    console.log("Current time:", currentTime.toFixed(2));
    console.log("Chapter start time:", currentChapter.time);
    console.log("Next chapter:", nextChapter?.title || "end of song");
    console.log("Next chapter time:", nextChapter?.time || "N/A");
    console.log("Time since last chapter update:", (performance.now() - lastUpdateTimeRef.current).toFixed(2), "ms");
    
    // Calculate chapter end time (either next chapter start or song end)
    const chapterEndTime = nextChapter ? nextChapter.time : Infinity;
    
    console.log("Chapter end time:", chapterEndTime);
    console.log("Time until chapter end:", (chapterEndTime - currentTime).toFixed(2));
    console.log("Loop threshold:", (chapterEndTime - 0.1).toFixed(2));

    // Check if we're at the end of the current chapter (within 0.1 seconds)
    const shouldLoop = currentTime >= chapterEndTime - 0.1;
    console.log("Should loop?", shouldLoop);
    console.log("Time comparison:", `${currentTime.toFixed(2)} >= ${(chapterEndTime - 0.1).toFixed(2)}`);

    if (shouldLoop) {
      console.log("\n!!! LOOP DECISION !!!");
      console.log(`Chapter end reached at ${currentTime.toFixed(2)}`);
      console.log(`Looping back to ${currentChapter.title} at ${currentChapter.time}`);
      console.log("!!!!!!!!!!!!!!!!!!!!!\n");
      return { shouldLoop: true, loopToTime: currentChapter.time };
    }

    console.log("Not time to loop yet");
    console.log("========================\n");
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