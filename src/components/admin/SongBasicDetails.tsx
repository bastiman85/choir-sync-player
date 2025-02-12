
import { Input } from "../ui/input";

interface SongBasicDetailsProps {
  title: string;
  onTitleChange: (title: string) => void;
  pdfUrl: string;
  onPdfUrlChange: (pdfUrl: string) => void;
}

const SongBasicDetails = ({
  title,
  onTitleChange,
  pdfUrl,
  onPdfUrlChange,
}: SongBasicDetailsProps) => {
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
