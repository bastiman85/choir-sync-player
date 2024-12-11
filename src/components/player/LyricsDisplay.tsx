import { LyricLine } from "@/types/song";
import { useEffect, useRef, useState } from "react";

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

  const shouldShowLyricBlock = (div: Element): boolean => {
    if (!activeVoicePart || activeVoicePart === 'all' || activeVoicePart === 'instrumental') {
      return true;
    }

    const voiceInitial = activeVoicePart[0].toLowerCase();
    const lattextblock = div.querySelector('.lattextblock');
    
    if (!lattextblock) return true;

    // Check if the lattextblock has the voice initial in its class list
    return lattextblock.classList.contains(voiceInitial);
  };

  const processHtmlContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
    
    const divs = tempDiv.querySelectorAll('[data-time]');
    
    if (divs.length === 0) {
      setError('No timed sections found in the HTML content');
      return;
    }

    let matchFound = false;
    let latestMatchingDiv: Element | null = null;

    // First pass: find the latest matching div based on time and voice part
    divs.forEach((div) => {
      const divTime = div.getAttribute('data-time');
      if (divTime && divTime <= timeString) {
        if (shouldShowLyricBlock(div)) {
          latestMatchingDiv = div;
          matchFound = true;
        }
      }
    });

    // If we found a matching div and it's different from the last one shown
    if (matchFound && latestMatchingDiv) {
      const divTime = latestMatchingDiv.getAttribute('data-time');
      if (divTime !== lastMatchedTimeRef.current) {
        setCurrentHtmlSection(latestMatchingDiv.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    } else if (currentTime === 0) {
      // For initial display, find the first div that matches the voice part
      const firstShowableDiv = Array.from(divs).find(div => shouldShowLyricBlock(div));
      if (firstShowableDiv) {
        setCurrentHtmlSection(firstShowableDiv.outerHTML);
        lastMatchedTimeRef.current = firstShowableDiv.getAttribute('data-time');
        setError(null);
      } else {
        // If no div matches the voice part, show nothing
        setCurrentHtmlSection('');
        lastMatchedTimeRef.current = null;
      }
    } else if (!matchFound) {
      // If no matching div is found for the current time and voice part,
      // find the last div before the current time that matches the voice part
      let lastValidDiv: Element | null = null;
      for (const div of Array.from(divs)) {
        const divTime = div.getAttribute('data-time');
        if (divTime && divTime <= timeString && shouldShowLyricBlock(div)) {
          lastValidDiv = div;
        }
      }
      
      if (lastValidDiv) {
        setCurrentHtmlSection(lastValidDiv.outerHTML);
        lastMatchedTimeRef.current = lastValidDiv.getAttribute('data-time');
        setError(null);
      } else {
        // If no matching div is found at all, show nothing
        setCurrentHtmlSection('');
        lastMatchedTimeRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (htmlContent && containerRef.current) {
      let content = htmlContent;
      
      if (htmlContent.startsWith('blob:') || htmlContent.startsWith('http')) {
        fetch(htmlContent)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch HTML content');
            }
            return response.text();
          })
          .then(html => {
            processHtmlContent(html);
          })
          .catch(() => {
            setError('Error loading HTML content');
          });
      } else {
        processHtmlContent(htmlContent);
      }
    }
  }, [currentTime, htmlContent, activeVoicePart]);

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