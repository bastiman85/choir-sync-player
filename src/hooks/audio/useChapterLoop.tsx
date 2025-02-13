
import { RefObject, useRef } from "react";
import { Song, ChapterMarker } from "@/types/song";

interface UseChapterLoopProps {
  audioRefs: RefObject<{ [key: string]: HTMLAudioElement }>;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  autoRestartChapter: boolean;
  song: Song;
  getCurrentChapter: () => ChapterMarker | null;
}

export const useChapterLoop = ({
  audioRefs,
  currentTime,
  setCurrentTime,
  autoRestartChapter,
  song,
  getCurrentChapter,
}: UseChapterLoopProps) => {
  const lastLoopCheckTimeRef = useRef<number>(performance.now());
  const loopCheckIntervalRef = useRef<number>(25);

  const handleChapterLoop = (currentPosition: number) => {
    if (!autoRestartChapter || !song.chapters?.length) {
      return false;
    }

    const now = performance.now();
    const timeSinceLastCheck = now - lastLoopCheckTimeRef.current;
    
    if (timeSinceLastCheck < loopCheckIntervalRef.current) {
      return false;
    }
    
    lastLoopCheckTimeRef.current = now;

    const currentChapter = getCurrentChapter();
    if (!currentChapter) {
      return false;
    }

    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    const currentChapterIndex = sortedChapters.findIndex(c => c.id === currentChapter.id);
    const nextChapter = sortedChapters[currentChapterIndex + 1];

    // Bestäm sluttiden för kapitlet baserat på endTime eller nästa kapitels starttid
    const chapterEndTime = currentChapter.endTime || (nextChapter?.time ?? Infinity);

    console.log("\n=== Loop Check Start ===");
    console.log("Current position:", currentPosition.toFixed(2));
    console.log("Current chapter:", currentChapter.title);
    console.log("Chapter start time:", currentChapter.time);
    console.log("Chapter end time:", chapterEndTime);
    console.log("Using explicit end time:", currentChapter.endTime ? "yes" : "no");
    console.log("Next chapter:", nextChapter?.title || "none");
    console.log("Time until chapter end:", (chapterEndTime - currentPosition).toFixed(2));

    // Kontrollera om vi har nått slutet av kapitlet
    if (currentPosition >= chapterEndTime) {
      console.log("\n!!! PERFORMING CHAPTER LOOP !!!");
      console.log("Timestamp:", new Date().toISOString());
      console.log(`Looping back to chapter "${currentChapter.title}" at time ${currentChapter.time}`);
      console.log("Distance past end:", (currentPosition - chapterEndTime).toFixed(2));

      // Reset all audio elements to the start av current chapter
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = currentChapter.time;
        if (!audio.muted) {
          audio.play().catch(error => console.error("Error playing audio:", error));
        }
      });
      
      setCurrentTime(currentChapter.time);
      return true;
    }

    console.log("=== Loop Check End ===\n");
    return false;
  };

  return { handleChapterLoop };
};
