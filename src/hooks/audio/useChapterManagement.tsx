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
        if (currentChapterRef.current?.id !== chapter.id) {
          console.log("Current chapter updated to:", chapter.title);
          console.log("Chapter start time:", chapter.time);
          if (nextChapter) {
            console.log("Next chapter:", nextChapter.title);
            console.log("Next chapter start time:", nextChapter.time);
          } else {
            console.log("This is the last chapter");
          }
          currentChapterRef.current = chapter;
          nextChapterRef.current = nextChapter || null;
        }
        break;
      }
    }
  }, [currentTime, song.chapters]);

  const shouldLoopChapter = useCallback((autoRestartChapter: boolean): { shouldLoop: boolean; loopToTime: number } => {
    if (!autoRestartChapter || !currentChapterRef.current) {
      console.log("Loop check skipped:", !autoRestartChapter ? "auto-restart is off" : "no current chapter");
      return { shouldLoop: false, loopToTime: 0 };
    }

    const currentChapter = currentChapterRef.current;
    const nextChapter = nextChapterRef.current;
    
    console.log("\n--- Chapter Loop Check ---");
    console.log("Current chapter:", currentChapter.title);
    console.log("Current time:", currentTime.toFixed(2));
    console.log("Chapter start time:", currentChapter.time);
    
    // Calculate chapter end time (either next chapter start or song end)
    const chapterEndTime = nextChapter ? nextChapter.time : Infinity;
    
    console.log("Chapter end time:", chapterEndTime);
    console.log("Time until chapter end:", (chapterEndTime - currentTime).toFixed(2));
    console.log("Will loop if time >= ", (chapterEndTime - 0.1).toFixed(2));

    // Check if we're at the end of the current chapter (within 0.1 seconds)
    if (currentTime >= chapterEndTime - 0.1) {
      console.log(`Chapter end reached at ${currentTime.toFixed(2)}. Looping back to ${currentChapter.title} at ${currentChapter.time}`);
      return { shouldLoop: true, loopToTime: currentChapter.time };
    }

    console.log("Not time to loop yet");
    console.log("------------------------\n");
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