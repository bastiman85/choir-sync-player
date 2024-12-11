import { LyricLine } from "@/types/song";
import { useEffect, useRef, useState } from "react";

interface LyricsDisplayProps {
  currentTime: number;
  lyrics: LyricLine[];
  htmlContent?: string;
}

const LyricsDisplay = ({ currentTime, lyrics, htmlContent }: LyricsDisplayProps) => {
  const [currentHtmlSection, setCurrentHtmlSection] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Create a temporary div to parse the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Convert current time to mmss format
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const timeString = `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;

      // Find the section that matches the current time
      const sections = tempDiv.querySelectorAll('[data-time]');
      let currentSection: Element | null = null;

      sections.forEach((section) => {
        const sectionTime = section.getAttribute('data-time');
        if (sectionTime && sectionTime <= timeString) {
          currentSection = section;
        }
      });

      if (currentSection) {
        setCurrentHtmlSection(currentSection.innerHTML);
      }
    }
  }, [currentTime, htmlContent]);

  const currentLyric = getCurrentLyric(currentTime, lyrics);

  return (
    <div className="bg-gray-100 p-4 rounded-lg min-h-[100px] flex items-center justify-center">
      {htmlContent ? (
        <div 
          ref={containerRef}
          className="prose prose-sm max-w-none w-full"
          dangerouslySetInnerHTML={{ __html: currentHtmlSection || '' }}
        />
      ) : (
        <p className="text-xl font-mono text-center">
          {currentLyric?.text || "♪ ♫ ♪ ♫"}
        </p>
      )}
    </div>
  );
};

export default LyricsDisplay;