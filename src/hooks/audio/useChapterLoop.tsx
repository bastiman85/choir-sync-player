
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
  const loopCheckIntervalRef = useRef<number>(500); // Kontrollera varannan sekund
  const activeChapterRef = useRef<{
    id: string;
    startTime: number;
    endTime?: number;
  } | null>(null);

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
      activeChapterRef.current = null;
      return false;
    }

    // Uppdatera alltid aktiva kapitlets detaljer
    activeChapterRef.current = {
      id: currentChapter.id,
      startTime: currentChapter.time,
      endTime: currentChapter.endTime
    };

    if (activeChapterRef.current && activeChapterRef.current.endTime) {
      const { startTime, endTime } = activeChapterRef.current;

      console.log("\n=== Chapter Update Check ===");
      console.log("Current time:", currentPosition.toFixed(2));
      console.log("Current chapter:", currentChapter.title);
      console.log("Raw chapter data:", currentChapter);
      console.log("Time until chapter end:", (endTime - currentPosition).toFixed(2));
      console.log("Next chapter starts at:", endTime + 1);

      // Mer exakt kontroll för loopning
      if (currentPosition >= endTime || Math.abs(endTime - currentPosition) < 0.1) {
        console.log("\n!!! PERFORMING CHAPTER LOOP !!!");
        console.log("Timestamp:", new Date().toISOString());
        console.log("Current position:", currentPosition.toFixed(4));
        console.log("Chapter end time:", endTime.toFixed(4));
        console.log("Looping back to:", startTime);
        console.log("Distance to end:", Math.abs(endTime - currentPosition).toFixed(4));
        console.log("=========================\n");

        // Återställ alla ljudelement till kapitlets starttid
        Object.values(audioRefs.current).forEach(audio => {
          if (!audio.muted) {
            audio.currentTime = startTime;
            audio.play().catch(error => console.error("Error playing audio:", error));
          } else {
            audio.currentTime = startTime;
          }
        });
        
        setCurrentTime(startTime);
        return true;
      }
    }

    return false;
  };

  return { handleChapterLoop };
};
