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
  const lastMatchedTimeRef = useRef<string | null>(null);

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

      // Find all divs with data-time attributes
      const divs = tempDiv.querySelectorAll('[data-time]');
      console.log('Found divs with data-time:', divs.length);
      
      let matchFound = false;
      let latestMatchingDiv: Element | null = null;

      // Find the latest matching div
      divs.forEach((div) => {
        const divTime = div.getAttribute('data-time');
        console.log('Checking div with time:', divTime);
        if (divTime && divTime <= timeString) {
          latestMatchingDiv = div;
          matchFound = true;
        }
      });

      // Update content only if we found a new match or if it's the first match
      if (matchFound && latestMatchingDiv) {
        const divTime = latestMatchingDiv.getAttribute('data-time');
        if (divTime !== lastMatchedTimeRef.current) {
          console.log('New matching div found with time:', divTime);
          setCurrentHtmlSection(latestMatchingDiv.innerHTML);
          lastMatchedTimeRef.current = divTime;
        }
      } else if (currentTime === 0) {
        // Reset to first div at the start
        const firstDiv = divs[0];
        if (firstDiv) {
          setCurrentHtmlSection(firstDiv.innerHTML);
          lastMatchedTimeRef.current = firstDiv.getAttribute('data-time');
        }
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