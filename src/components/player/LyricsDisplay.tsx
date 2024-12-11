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
      console.log('Attempting to process HTML content...');
      console.log('HTML Content URL:', htmlContent);

      // Fetch the HTML content
      fetch(htmlContent)
        .then(response => {
          console.log('Fetch response status:', response.status);
          if (!response.ok) {
            throw new Error(`Failed to fetch HTML content: ${response.status}`);
          }
          return response.text();
        })
        .then(html => {
          console.log('Successfully fetched HTML content');
          console.log('HTML content length:', html.length);
          
          // Create a temporary div to parse the HTML content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;

          // Convert current time to mmss format
          const minutes = Math.floor(currentTime / 60);
          const seconds = Math.floor(currentTime % 60);
          const timeString = `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;

          console.log('Current time string:', timeString);

          // Find all divs with data-time attributes
          const divs = tempDiv.querySelectorAll('[data-time]');
          console.log('Found divs with data-time:', divs.length);
          
          if (divs.length === 0) {
            console.warn('No divs found with data-time attributes in the HTML content');
            setError('No timed sections found in the HTML content');
            return;
          }

          // Log all data-time values for debugging
          divs.forEach((div, index) => {
            console.log(`Div ${index} time:`, div.getAttribute('data-time'));
          });
          
          let matchFound = false;
          let latestMatchingDiv: Element | null = null;

          // Find the latest matching div
          divs.forEach((div) => {
            const divTime = div.getAttribute('data-time');
            if (divTime && divTime <= timeString) {
              latestMatchingDiv = div;
              matchFound = true;
              console.log('Found matching div with time:', divTime);
            }
          });

          // Update content only if we found a new match or if it's the first match
          if (matchFound && latestMatchingDiv) {
            const divTime = latestMatchingDiv.getAttribute('data-time');
            if (divTime !== lastMatchedTimeRef.current) {
              console.log('New matching div found with time:', divTime);
              console.log('Content:', latestMatchingDiv.innerHTML);
              setCurrentHtmlSection(latestMatchingDiv.innerHTML);
              lastMatchedTimeRef.current = divTime;
              setError(null);
            }
          } else if (currentTime === 0) {
            // Reset to first div at the start
            const firstDiv = divs[0];
            if (firstDiv) {
              console.log('Resetting to first div');
              setCurrentHtmlSection(firstDiv.innerHTML);
              lastMatchedTimeRef.current = firstDiv.getAttribute('data-time');
              setError(null);
            }
          }
        })
        .catch(err => {
          console.error('Error processing HTML content:', err);
          setError(`Error loading HTML content: ${err.message}`);
        });
    }
  }, [currentTime, htmlContent]);

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
              className="prose prose-sm max-w-none w-full"
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