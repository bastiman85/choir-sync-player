import { useRef, useEffect } from "react";

interface HtmlLyricsViewProps {
  htmlContent: string;
  error: string | null;
}

export const HtmlLyricsView = ({ htmlContent, error }: HtmlLyricsViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Update innerHTML when htmlContent changes
  useEffect(() => {
    if (containerRef.current && htmlContent) {
      containerRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]); // Add htmlContent as a dependency

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div 
      ref={containerRef}
      className="lyrics-display w-full text-center space-y-4"
    />
  );
};