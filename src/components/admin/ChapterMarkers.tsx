import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ChapterMarker } from "@/types/song";

interface ChapterMarkersProps {
  chapters: ChapterMarker[];
  onChaptersChange: (chapters: ChapterMarker[]) => void;
}

const ChapterMarkers = ({ chapters, onChaptersChange }: ChapterMarkersProps) => {
  const addChapter = () => {
    const newChapter: ChapterMarker = {
      id: Math.random().toString(),
      title: "",
      time: 0,
      type: "verse",
    };
    onChaptersChange([...chapters, newChapter]);
  };

  const updateChapter = (id: string, field: keyof ChapterMarker, value: string | number) => {
    onChaptersChange(
      chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    );
  };

  const removeChapter = (id: string) => {
    onChaptersChange(chapters.filter((chapter) => chapter.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium">Chapter Markers</label>
        <Button type="button" onClick={addChapter} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      </div>
      <div className="space-y-4">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="flex gap-4 items-center">
            <Input
              placeholder="Chapter title"
              value={chapter.title}
              onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Time (seconds)"
              value={chapter.time}
              onChange={(e) =>
                updateChapter(chapter.id, "time", parseFloat(e.target.value))
              }
              className="w-32"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeChapter(chapter.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterMarkers;