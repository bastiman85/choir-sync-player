import { Song, ChapterMarker } from "@/types/song";
import { useRef } from "react";

export const useChapterManagement = (position: number, song: Song) => {
  const currentChapterRef = useRef<ChapterMarker | null>(null);
  const nextChapterRef = useRef<ChapterMarker | null>(null);

  const updateChapterRefs = () => {
    if (!song.chapters?.length) {
      currentChapterRef.current = null;
      nextChapterRef.current = null;
      return;
    }

    const sortedChapters = [...song.chapters].sort((a, b) => a.time - b.time);
    
    // Find current chapter
    let newCurrentChapter: ChapterMarker | null = null;
    let newNextChapter: ChapterMarker | null = null;

    for (let i = 0; i < sortedChapters.length; i++) {
      const chapter = sortedChapters[i];
      const nextChapter = sortedChapters[i + 1];

      if (position >= chapter.time && (!nextChapter || position < nextChapter.time)) {
        newCurrentChapter = chapter;
        newNextChapter = nextChapter || null;
        break;
      }
    }

    // Update refs if chapters have changed
    if (newCurrentChapter?.id !== currentChapterRef.current?.id) {
      console.log("Updating current chapter to:", newCurrentChapter?.title);
      currentChapterRef.current = newCurrentChapter;
    }
    if (newNextChapter?.id !== nextChapterRef.current?.id) {
      console.log("Updating next chapter to:", newNextChapter?.title);
      nextChapterRef.current = newNextChapter;
    }
  };

  const getCurrentChapter = () => {
    updateChapterRefs();
    return currentChapterRef.current;
  };

  const getNextChapter = () => {
    return nextChapterRef.current;
  };

  const shouldLoopToCurrentChapter = (autoRestartChapter: boolean) => {
    if (!autoRestartChapter || !currentChapterRef.current || !nextChapterRef.current) {
      return false;
    }

    // Check if we just entered the next chapter (within 0.1 seconds)
    const justEnteredNextChapter = 
      position >= nextChapterRef.current.time && 
      position <= nextChapterRef.current.time + 0.1;

    if (justEnteredNextChapter) {
      console.log("Just entered next chapter, should loop back to:", currentChapterRef.current.title);
      return true;
    }

    // Check if we reached the end of current chapter
    const chapterEndTime = nextChapterRef.current ? nextChapterRef.current.time : Infinity;
    const reachedChapterEnd = position >= chapterEndTime - 0.1;

    if (reachedChapterEnd) {
      console.log("Reached end of chapter, should loop back to:", currentChapterRef.current.title);
      return true;
    }

    return false;
  };

  return {
    getCurrentChapter,
    getNextChapter,
    shouldLoopToCurrentChapter,
  };
};