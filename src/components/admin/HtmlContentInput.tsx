import { Input } from "../ui/input";

interface HtmlContentInputProps {
  htmlContentUrl: string;
  onHtmlContentUrlChange: (url: string) => void;
}

const HtmlContentInput = ({
  htmlContentUrl,
  onHtmlContentUrlChange,
}: HtmlContentInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        HTML Content URL (optional)
        <span className="text-xs text-muted-foreground ml-2">
          (URL to HTML file with data-time attributes)
        </span>
      </label>
      <Input
        type="url"
        value={htmlContentUrl}
        onChange={(e) => onHtmlContentUrlChange(e.target.value)}
        placeholder="https://example.com/song-content.html"
      />
    </div>
  );
};

export default HtmlContentInput;