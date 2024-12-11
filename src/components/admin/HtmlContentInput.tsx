import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";

interface HtmlContentInputProps {
  htmlContentUrl: string;
  onHtmlContentUrlChange: (url: string) => void;
}

const HtmlContentInput = ({
  htmlContentUrl,
  onHtmlContentUrlChange,
}: HtmlContentInputProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/html') {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      onHtmlContentUrlChange(fileUrl);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">
          HTML Content URL
          <span className="text-xs text-muted-foreground ml-2">
            (URL to HTML file with data-time attributes)
          </span>
        </Label>
        <Input
          type="url"
          value={htmlContentUrl}
          onChange={(e) => onHtmlContentUrlChange(e.target.value)}
          placeholder="https://example.com/song-content.html"
        />
      </div>

      <div className="space-y-2">
        <Label className="block text-sm font-medium">
          Or upload HTML file directly
        </Label>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".html"
            onChange={handleFileChange}
            className="flex-1"
          />
          {selectedFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedFile(null);
                onHtmlContentUrlChange('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default HtmlContentInput;