import { LyricLine } from "@/types/song";
import { useEffect, useRef, useState } from "react";

interface LyricsDisplayProps {
  currentTime: number;
  lyrics: LyricLine[];
  htmlContent?: string;
}

const LyricsDisplay = ({ currentTime, lyrics, htmlContent }: LyricsDisplayProps) => {
  const [currentHtmlSection, setCurrentHtmlSection] = useState<string | null>(null);
  const [fullHtmlContent, setFullHtmlContent] = useState<string>("");
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
      let content = htmlContent;
      
      if (!content.startsWith('<')) {
        fetch(content)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch HTML content');
            }
            return response.text();
          })
          .then(html => {
            setFullHtmlContent(html);
            processHtmlContent(html);
          })
          .catch(() => {
            setError('Error loading HTML content');
          });
      } else {
        setFullHtmlContent(content);
        processHtmlContent(content);
      }
    }
  }, [currentTime, htmlContent]);

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

    divs.forEach((div) => {
      const divTime = div.getAttribute('data-time');
      if (divTime && divTime <= timeString) {
        latestMatchingDiv = div;
        matchFound = true;
      }
    });

    if (matchFound && latestMatchingDiv) {
      const divTime = latestMatchingDiv.getAttribute('data-time');
      if (divTime !== lastMatchedTimeRef.current) {
        // Instead of replacing content, we'll add a class to highlight the current section
        const allDivs = tempDiv.querySelectorAll('[data-time]');
        allDivs.forEach(div => {
          if (div === latestMatchingDiv) {
            div.classList.add('current-section');
          } else {
            div.classList.remove('current-section');
          }
        });
        setCurrentHtmlSection(tempDiv.innerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    } else if (currentTime === 0) {
      const firstDiv = divs[0];
      if (firstDiv) {
        firstDiv.classList.add('current-section');
        setCurrentHtmlSection(tempDiv.innerHTML);
        lastMatchedTimeRef.current = firstDiv.getAttribute('data-time');
        setError(null);
      }
    }
  };

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
              className="w-full text-center"
              dangerouslySetInnerHTML={{ __html: currentHtmlSection || fullHtmlContent }}
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