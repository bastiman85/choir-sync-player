import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Choir } from "@/types/song";

interface SongBasicDetailsProps {
  title: string;
  onTitleChange: (title: string) => void;
  choirId: string;
  onChoirIdChange: (choirId: string) => void;
  choirs: Choir[];
}

const SongBasicDetails = ({
  title,
  onTitleChange,
  choirId,
  onChoirIdChange,
  choirs,
}: SongBasicDetailsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Song Title</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter song title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Choir</label>
        <Select value={choirId} onValueChange={onChoirIdChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a choir" />
          </SelectTrigger>
          <SelectContent>
            {choirs.map((choir) => (
              <SelectItem key={choir.id} value={choir.id}>
                {choir.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SongBasicDetails;