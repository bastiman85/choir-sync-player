
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
  const loopCheckIntervalRef = useRef<number>(10);
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

    // Uppdatera aktivt kapitel endast om vi nått ett nytt kapitels starttid
    if (!activeChapterRef.current || currentChapter.id !== activeChapterRef.current.id) {
      activeChapterRef.current = {
        id: currentChapter.id,
        startTime: currentChapter.time,
        endTime: currentChapter.endTime
      };

      console.log("\n=== New Active Chapter ===");
      console.log("Chapter:", currentChapter.title);
      console.log("Start time:", activeChapterRef.current.startTime);
      console.log("End time:", currentChapter.endTime || "Not set (no auto-loop)");
      console.log("Current position:", currentPosition);
    }

    // Använd det aktiva kapitlets gränser för loopning
    if (activeChapterRef.current && activeChapterRef.current.endTime) {
      const { startTime, endTime } = activeChapterRef.current;

      // Kontrollera om vi nått slutet av det aktiva kapitlet
      if (currentPosition >= endTime) {
        console.log("\n!!! PERFORMING CHAPTER LOOP !!!");
        console.log("Timestamp:", new Date().toISOString());
        console.log("Current position:", currentPosition.toFixed(2));
        console.log("Chapter end time:", endTime);
        console.log("Looping back to:", startTime);
        console.log("Distance past end:", (currentPosition - endTime).toFixed(2));

        // Reset alla ljudelement till kapitlets starttid
        Object.values(audioRefs.current).forEach(audio => {
          audio.currentTime = startTime;
          if (!audio.muted) {
            audio.play().catch(error => console.error("Error playing audio:", error));
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
