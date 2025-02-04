import { useRef, useEffect } from "react";

interface HtmlLyricsViewProps {
  htmlContent: string;
  error: string | null;
}

export const HtmlLyricsView = ({ htmlContent, error }: HtmlLyricsViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only set innerHTML if container is empty or error state changes
    if (containerRef.current && (!containerRef.current.innerHTML || error)) {
      containerRef.current.innerHTML = htmlContent || '';
    }
  }, [htmlContent, error]);

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