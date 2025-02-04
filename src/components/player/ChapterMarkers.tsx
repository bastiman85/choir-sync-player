import { ChapterMarker } from "@/types/song";
import { Button } from "../ui/button";

interface ChapterMarkersProps {
  chapters: ChapterMarker[];
  onChapterClick: (time: number) => void;
  currentTime: number;
}

const ChapterMarkers = ({ chapters, onChapterClick, currentTime }: ChapterMarkersProps) => {
  const isCurrentChapter = (chapter: ChapterMarker) => {
    const nextChapter = chapters.find(c => c.time > chapter.time);
    return currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border rounded-md p-2">
      <div className="space-y-0">
        {chapters.map((chapter) => (
          <Button
            key={chapter.id}
            variant={isCurrentChapter(chapter) ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onChapterClick(chapter.time)}
          >
            {chapter.title} ({formatTime(chapter.time)})
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChapterMarkers;