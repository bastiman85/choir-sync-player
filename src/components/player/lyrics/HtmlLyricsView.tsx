import { useRef, useEffect } from "react";

interface HtmlLyricsViewProps {
  htmlContent: string;
  error: string | null;
}

export const HtmlLyricsView = ({ htmlContent, error }: HtmlLyricsViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Only set innerHTML on initial load or when htmlContent changes completely
  useEffect(() => {
    if (containerRef.current && htmlContent) {
      containerRef.current.innerHTML = htmlContent;
    }
  }, []);

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