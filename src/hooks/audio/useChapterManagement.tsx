import { Song } from "@/types/song";

export const useChapterManagement = (currentTime: number, song: Song) => {
  const getCurrentChapter = () => {
    if (!song.chapters?.length) return null;
    return song.chapters
      .slice()
      .reverse()
      .find(chapter => currentTime >= chapter.time);
  };

  return {
    getCurrentChapter,
  };
};