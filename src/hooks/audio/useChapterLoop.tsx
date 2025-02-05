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
  const autoRestartChapterRef = useRef(false);

  useEffect(() => {
    autoRestartChapterRef.current = autoRestartChapter;
    console.log("Auto restart chapter state changed to:", autoRestartChapter);
  }, [autoRestartChapter]);

  const handleChapterLoop = (currentPosition: number) => {
    const firstAudio = Object.values(audioRefs.current)[0];
    if (!firstAudio) {
      console.log("No audio element found");
      return;
    }

    console.log("------- Loop Check Start -------");
    console.log("Current position:", currentPosition);
    console.log("Auto restart chapter:", autoRestartChapterRef.current);

    if (autoRestartChapterRef.current && song.chapters?.length > 0) {
      const currentChapter = getCurrentChapter();
      console.log("Current chapter:", currentChapter);

      if (currentChapter) {
        const nextChapter = song.chapters.find(c => c.time > currentChapter.time);
        const chapterEndTime = nextChapter ? nextChapter.time : firstAudio.duration;

        console.log("Current chapter title:", currentChapter.title);
        console.log("Chapter end time:", chapterEndTime);
        console.log("Time until chapter end:", chapterEndTime - currentPosition);
        console.log("Next chapter starts at:", nextChapter ? nextChapter.time : "end of song");
        console.log("Should loop if position reaches:", chapterEndTime - 0.1);

        if (currentPosition >= chapterEndTime - 0.1) {
          console.log("LOOPING: Restarting chapter from:", currentChapter.time);
          Object.values(audioRefs.current).forEach(audio => {
            audio.currentTime = currentChapter.time;
            if (!audio.muted) {
              audio.play().catch(error => console.error("Error playing audio:", error));
            }
          });
          setCurrentTime(currentChapter.time);
          return true;
        }
      }
    }
    console.log("------- Loop Check End -------");
    return false;
  };

  return { handleChapterLoop };
};