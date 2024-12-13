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
    if (htmlContent && containerRef.current) {
      if (htmlContent.startsWith('blob:') || htmlContent.startsWith('http')) {
        fetch(htmlContent)
          .then(response => {
            if (!response.ok) {
              throw new Error('Kunde inte hämta HTML-innehåll');
            }
            return response.text();
          })
          .then(html => {
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
          })
          .catch(() => {
            setError('Fel vid laddning av HTML-innehåll');
          });
      } else {
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
    }
  }, [currentTime, htmlContent, activeVoicePart]);

  const currentLyric = getCurrentLyric(currentTime, lyrics);

  return (
    <div className="min-h-[100px] flex items-center justify-center px-0">
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