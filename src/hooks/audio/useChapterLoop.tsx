
import { RefObject, useEffect, useRef } from "react";
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
  const loopCheckIntervalRef = useRef<number>(50); // 50ms check interval
  const audioEndThreshold = useRef<number>(0.5); // threshold for end of audio

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
    
    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    const currentChapterIndex = sortedChapters.findIndex(c => c.id === currentChapter.id);
    const nextChapter = sortedChapters[currentChapterIndex + 1];
    
    // Get the first audio element to check total duration
    const firstAudio = Object.values(audioRefs.current)[0];
    const totalDuration = firstAudio?.duration || Infinity;
    
    // If this is the last chapter, use the audio duration as the end time
    const chapterEndTime = nextChapter ? nextChapter.time : totalDuration;
    
    console.log("Next chapter starts at:", nextChapter?.time || "end of song");
    console.log("Current chapter ends at:", chapterEndTime);
    console.log("Time until chapter end:", (chapterEndTime - currentPosition).toFixed(2));
    console.log("Loop threshold:", (chapterEndTime - audioEndThreshold.current).toFixed(2));
    console.log("Total duration:", totalDuration);
    console.log("Is last chapter:", !nextChapter ? "yes" : "no");

    // Check if we're close to the end of the chapter
    // For the last chapter, use a larger threshold to ensure we catch the loop
    const thresholdTime = nextChapter ? 0.2 : audioEndThreshold.current;
    
    if (currentPosition >= chapterEndTime - thresholdTime) {
      console.log("\n!!! PERFORMING CHAPTER LOOP !!!");
      console.log("Timestamp:", new Date().toISOString());
      console.log(`Looping back to chapter "${currentChapter.title}" at time ${currentChapter.time}`);
      console.log("Using threshold:", thresholdTime);

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
