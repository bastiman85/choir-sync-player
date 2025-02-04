import { useEffect, useRef } from "react";

interface HtmlLyricsViewProps {
  htmlContent: string;
  error: string | null;
}

export const HtmlLyricsView = ({ htmlContent, error }: HtmlLyricsViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only update innerHTML if container is empty or htmlContent has changed completely
    if (containerRef.current && (!containerRef.current.innerHTML || containerRef.current.innerHTML !== htmlContent)) {
      containerRef.current.innerHTML = htmlContent || '';
    }
  }, [htmlContent]);

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