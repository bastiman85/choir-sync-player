import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface HtmlContentInputProps {
  htmlContentUrl: string;
  onHtmlContentUrlChange: (url: string) => void;
  htmlFileUrl: string;
  onHtmlFileUrlChange: (url: string) => void;
}

const HtmlContentInput = ({
  htmlContentUrl,
  onHtmlContentUrlChange,
  htmlFileUrl,
  onHtmlFileUrlChange,
}: HtmlContentInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">
          HTML-fil URL
          <span className="text-xs text-muted-foreground ml-2">
            (Länk till HTML-fil med data-time attribut)
          </span>
        </Label>
        <Input
          type="url"
          value={htmlFileUrl}
          onChange={(e) => onHtmlFileUrlChange(e.target.value)}
          placeholder="https://example.com/lyrics.html"
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label className="block text-sm font-medium mb-2">
          HTML-innehåll
          <span className="text-xs text-muted-foreground ml-2">
            (Klistra in HTML-innehåll med data-time attribut)
          </span>
        </Label>
        <Textarea
          value={htmlContentUrl}
          onChange={(e) => onHtmlContentUrlChange(e.target.value)}
          placeholder="<div data-time='0000'>First verse...</div>"
          className="min-h-[200px] font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default HtmlContentInput;