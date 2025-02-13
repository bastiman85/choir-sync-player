
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
  const loopCheckIntervalRef = useRef<number>(50); // Mycket tätare kontroller (50ms)
  const activeChapterRef = useRef<{
    id: string;
    startTime: number;
    endTime?: number;
  } | null>(null);

  const handleChapterLoop = (currentPosition: number) => {
    if (!autoRestartChapter || !song.chapters?.length) {
      console.log("\n=== Chapter Loop Status ===");
      console.log("Auto restart chapter:", autoRestartChapter);
      console.log("Has chapters:", !!song.chapters?.length);
      console.log("Loop aborted - feature disabled or no chapters");
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
      console.log("No current chapter found");
      activeChapterRef.current = null;
      return false;
    }

    console.log("\n=== Loop Check ===");
    console.log("Current chapter:", currentChapter.title);
    console.log("Start time:", currentChapter.time);
    console.log("End time:", currentChapter.endTime);
    console.log("Current position:", currentPosition);
    console.log("Auto restart enabled:", autoRestartChapter);

    // Uppdatera alltid aktiva kapitlets detaljer
    activeChapterRef.current = {
      id: currentChapter.id,
      startTime: currentChapter.time,
      endTime: currentChapter.endTime
    };

    if (activeChapterRef.current && activeChapterRef.current.endTime) {
      const { startTime, endTime } = activeChapterRef.current;

      // Mer exakt kontroll för loopning med mindre marginal
      if (currentPosition >= endTime || Math.abs(endTime - currentPosition) < 0.05) {
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
