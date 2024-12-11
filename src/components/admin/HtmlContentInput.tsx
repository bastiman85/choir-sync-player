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
  const handleContentChange = (content: string) => {
    // Create a blob from the HTML content and generate an object URL
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    onHtmlContentUrlChange(url);
  };

  // Convert object URL back to content for editing
  const getContentFromUrl = (url: string): string => {
    if (!url) return '';
    try {
      // Extract content from blob URL if it exists
      const match = url.match(/^blob:/);
      if (match) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);  // Synchronous request
        xhr.send(null);
        return xhr.responseText;
      }
      return '';
    } catch (error) {
      return '';
    }
  };

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
          value={getContentFromUrl(htmlContentUrl)}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="<div data-time='0000'>First verse...</div>"
          className="min-h-[200px] font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default HtmlContentInput;