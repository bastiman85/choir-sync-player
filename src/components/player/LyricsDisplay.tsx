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

      console.log('Current HTML content length:', htmlContent.length);
      console.log('Current time string:', timeString);

      // Find the div that matches the current time
      const divs = tempDiv.querySelectorAll('[data-time]');
      console.log('Found divs with data-time:', divs.length);
      
      let currentDiv: Element | null = null;

      divs.forEach((div) => {
        const divTime = div.getAttribute('data-time');
        console.log('Checking div with time:', divTime);
        if (divTime && divTime <= timeString) {
          currentDiv = div;
        }
      });

      // If no div is found or currentTime is 0, show the first div
      if (!currentDiv && divs.length > 0 && currentTime === 0) {
        currentDiv = divs[0];
      }

      if (currentDiv) {
        console.log('Selected div content length:', currentDiv.innerHTML.length);
        setCurrentHtmlSection(currentDiv.innerHTML);
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
          dangerouslySetInnerHTML={{ __html: currentHtmlSection || htmlContent }}
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