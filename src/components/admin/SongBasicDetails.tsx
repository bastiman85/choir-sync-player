import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Choir } from "@/types/song";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SongBasicDetailsProps {
  title: string;
  onTitleChange: (title: string) => void;
  choirId: string;
  onChoirIdChange: (choirId: string) => void;
}

const SongBasicDetails = ({
  title,
  onTitleChange,
  choirId,
  onChoirIdChange,
}: SongBasicDetailsProps) => {
  const { data: choirs = [] } = useQuery({
    queryKey: ['choirs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('choirs')
        .select('*');
      if (error) throw error;
      return data as Choir[];
    }
  });

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