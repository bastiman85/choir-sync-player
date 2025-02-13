
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

    // Bara loopa om kapitlet har ett endTime
    if (!currentChapter.endTime) {
      return false;
    }

    console.log("\n=== Loop Check Start ===");
    console.log("Current position:", currentPosition.toFixed(2));
    console.log("Current chapter:", currentChapter.title);
    console.log("Chapter end time:", currentChapter.endTime);
    console.log("Time until chapter end:", (currentChapter.endTime - currentPosition).toFixed(2));

    // Kontrollera om vi har nått kapitlets explicita sluttid
    if (currentPosition >= currentChapter.endTime) {
      console.log("\n!!! PERFORMING CHAPTER LOOP !!!");
      console.log("Timestamp:", new Date().toISOString());
      console.log(`Looping back to chapter "${currentChapter.title}" at time ${currentChapter.time}`);
      console.log("Distance past end:", (currentPosition - currentChapter.endTime).toFixed(2));

      // Reset all audio elements to the start of the current chapter
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
