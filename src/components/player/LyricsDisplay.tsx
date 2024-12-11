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
  const [filteredHtml, setFilteredHtml] = useState<string | null>(null);
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

  // Filter HTML content when voice part changes
  useEffect(() => {
    if (htmlContent && containerRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      if (activeVoicePart && ['soprano', 'alto', 'tenor', 'bass'].includes(activeVoicePart)) {
        const voiceInitial = activeVoicePart[0].toLowerCase();
        const allDivs = tempDiv.querySelectorAll('[data-time]');
        const filteredSections = document.createElement('div');
        
        allDivs.forEach(div => {
          const filteredDiv = filterVoicePart(div, voiceInitial);
          if (filteredDiv && showVoicePart(div, activeVoicePart)) {
            filteredSections.appendChild(filteredDiv);
          }
        });
        
        setFilteredHtml(filteredSections.innerHTML);
      } else {
        setFilteredHtml(htmlContent);
      }
    }
  }, [htmlContent, activeVoicePart]);

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
              filteredHtml || html,
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
          filteredHtml || htmlContent,
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
  }, [currentTime, htmlContent, activeVoicePart, filteredHtml]);

  const currentLyric = getCurrentLyric(currentTime, lyrics);

  return (
    <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] flex items-center justify-center">
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