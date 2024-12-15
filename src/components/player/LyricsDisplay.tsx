import { LyricLine } from "@/types/song";
import { useEffect, useRef, useState } from "react";
import { filterVoicePart, showVoicePart } from "./lyrics/VoicePartFilter";
import { processHtmlContent } from "./lyrics/HtmlContentProcessor";

interface LyricsDisplayProps {
  currentTime: number;
  lyrics: LyricLine[];
  htmlContent?: string;
  activeVoicePart?: string;
}

const LyricsDisplay = ({ currentTime, lyrics, htmlContent, activeVoicePart }: LyricsDisplayProps) => {
  const [currentHtmlSection, setCurrentHtmlSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMatchedTimeRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLyric = (time: number, lyrics: LyricLine[]): LyricLine | undefined => {
    const sortedLyrics = [...lyrics].sort((a, b) => a.startTime - b.startTime);
    
    for (let i = 0; i < sortedLyrics.length; i++) {
      const currentLine = sortedLyrics[i];
      const nextLine = sortedLyrics[i + 1];
      
      if (time >= currentLine.startTime && 
          (!nextLine || time < nextLine.startTime)) {
        return currentLine;
      }
    }
    
    return undefined;
  };

  useEffect(() => {
    console.log('LyricsDisplay - Active voice part:', activeVoicePart);
    console.log('LyricsDisplay - HTML content:', htmlContent);
    
    if (!htmlContent) return;

    const processContent = async () => {
      try {
        if (htmlContent.startsWith('blob:') || htmlContent.startsWith('http')) {
          const response = await fetch(htmlContent);
          if (!response.ok) {
            throw new Error(`Failed to fetch HTML content: ${response.status} ${response.statusText}`);
          }
          const html = await response.text();
          console.log('Fetched HTML content:', html.substring(0, 200) + '...');
          processHtmlContent(
            html,
            currentTime,
            activeVoicePart,
            lastMatchedTimeRef,
            setCurrentHtmlSection,
            setError,
            filterVoicePart,
            showVoicePart
          );
        } else {
          console.log('Processing inline HTML content');
          processHtmlContent(
            htmlContent,
            currentTime,
            activeVoicePart,
            lastMatchedTimeRef,
            setCurrentHtmlSection,
            setError,
            filterVoicePart,
            showVoicePart
          );
        }
      } catch (err) {
        console.error('Error processing HTML content:', err);
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid laddning av innehållet');
      }
    };

    processContent();
  }, [currentTime, htmlContent, activeVoicePart]);

  const currentLyric = getCurrentLyric(currentTime, lyrics);

  return (
    <div className="rounded-lg min-h-[100px] flex items-center justify-center">
      {htmlContent ? (
        <div className="w-full">
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div 
              ref={containerRef}
              className="lyrics-display w-full text-center space-y-4"
              dangerouslySetInnerHTML={{ __html: currentHtmlSection || '' }}
            />
          )}
        </div>
      ) : (
        <p className="text-xl font-mono text-center">
          {currentLyric?.text || "♪ ♫ ♪ ♫"}
        </p>
      )}
    </div>
  );
};

export default LyricsDisplay;