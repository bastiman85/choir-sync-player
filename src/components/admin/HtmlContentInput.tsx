import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface HtmlContentInputProps {
  htmlContentUrl: string;
  onHtmlContentUrlChange: (url: string) => void;
}

const HtmlContentInput = ({
  htmlContentUrl,
  onHtmlContentUrlChange,
}: HtmlContentInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium mb-2">
          HTML Content
          <span className="text-xs text-muted-foreground ml-2">
            (Paste HTML content with data-time attributes)
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