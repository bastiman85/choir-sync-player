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
  pdfUrl: string;
  onPdfUrlChange: (pdfUrl: string) => void;
}

const SongBasicDetails = ({
  title,
  onTitleChange,
  choirId,
  onChoirIdChange,
  pdfUrl,
  onPdfUrlChange,
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
        <label className="block text-sm font-medium mb-2">Sångtitel</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ange sångtitel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Kör</label>
        <Select value={choirId} onValueChange={onChoirIdChange}>
          <SelectTrigger>
            <SelectValue placeholder="Välj en kör" />
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

      <div>
        <label className="block text-sm font-medium mb-2">PDF URL</label>
        <Input
          type="url"
          value={pdfUrl}
          onChange={(e) => onPdfUrlChange(e.target.value)}
          placeholder="Ange URL till PDF-fil"
        />
      </div>
    </div>
  );
};

export default SongBasicDetails;