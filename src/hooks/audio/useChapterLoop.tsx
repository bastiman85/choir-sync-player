
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
  const loopCheckIntervalRef = useRef<number>(25); // Kontrollera var 25:e millisekund

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

    console.log("\n=== Loop Check Start ===");
    console.log("Current position:", currentPosition.toFixed(2));
    console.log("Current chapter:", currentChapter.title);
    console.log("Chapter end time:", currentChapter.endTime);
    
    // Om endTime inte är satt, använd nästa kapitels starttid minus 1 sekund
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    const currentChapterIndex = sortedChapters.findIndex(c => c.id === currentChapter.id);
    const nextChapter = sortedChapters[currentChapterIndex + 1];
    
    // Get first audio element to check total duration
    const firstAudio = Object.values(audioRefs.current)[0];
    const totalDuration = firstAudio?.duration || Infinity;
    
    // Använd explicit endTime om det finns, annars fallback till nästa kapitels start minus 1 sekund
    const chapterEndTime = currentChapter.endTime ?? 
      (nextChapter ? nextChapter.time - 1 : totalDuration);
    
    console.log("Chapter explicit end time:", currentChapter.endTime);
    console.log("Next chapter starts at:", nextChapter?.time || "end of song");
    console.log("Calculated end time:", chapterEndTime);
    console.log("Time until chapter end:", (chapterEndTime - currentPosition).toFixed(2));
    console.log("Total duration:", totalDuration);

    // Kontrollera om vi har nått kapitlets slut
    if (currentPosition >= chapterEndTime) {
      console.log("\n!!! PERFORMING CHAPTER LOOP !!!");
      console.log("Timestamp:", new Date().toISOString());
      console.log(`Looping back to chapter "${currentChapter.title}" at time ${currentChapter.time}`);
      console.log("Distance past end:", (currentPosition - chapterEndTime).toFixed(2));

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
