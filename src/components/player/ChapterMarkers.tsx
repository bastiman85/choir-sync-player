import { ChapterMarker } from "@/types/song";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

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

  return (
    <ScrollArea className="h-32 rounded-md border p-4">
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <Button
            key={chapter.id}
            variant={isCurrentChapter(chapter) ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onChapterClick(chapter.time)}
          >
            <span className="mr-2">{chapter.type === "verse" ? "V" : chapter.type === "chorus" ? "C" : chapter.type === "bridge" ? "B" : "•"}</span>
            {chapter.title}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ChapterMarkers;