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

  const showVoicePart = (element: Element): boolean => {
    if (!activeVoicePart || activeVoicePart === 'all' || activeVoicePart === 'instrumental') {
      console.log('Showing all voice parts due to activeVoicePart:', activeVoicePart);
      return true;
    }

    const voiceInitial = activeVoicePart[0].toLowerCase();
    
    // Get all lattextblocks within this time section
    const lattextblocks = element.querySelectorAll('.lattextblock');
    console.log('Checking lattextblocks in current section:', lattextblocks.length);
    
    // Check if any lattextblock in this section matches the voice part
    for (const block of lattextblocks) {
      const classes = Array.from(block.classList);
      console.log('Checking classes for voice part in section:', classes, 'looking for:', voiceInitial);
      
      if (classes.includes(voiceInitial)) {
        console.log('Found matching voice part in section');
        return true;
      }
    }
    
    console.log('No matching voice part found in section');
    return false;
  };

  const processHtmlContent = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
    
    console.log('Processing HTML content for time:', timeString, 'activeVoicePart:', activeVoicePart);
    
    const divs = tempDiv.querySelectorAll('[data-time]');
    
    if (divs.length === 0) {
      setError('No timed sections found in the HTML content');
      return;
    }

    let currentTimeMatchingDiv: Element | null = null;
    
    // First, find the correct time section
    for (const div of divs) {
      const divTime = div.getAttribute('data-time');
      console.log('Checking div with time:', divTime, 'content:', div.textContent?.slice(0, 50));
      
      if (divTime && divTime <= timeString) {
        currentTimeMatchingDiv = div;
        console.log('Found time-matching div:', divTime);
      } else {
        // Stop searching once we've passed the current time
        break;
      }
    }

    if (currentTimeMatchingDiv) {
      const divTime = currentTimeMatchingDiv.getAttribute('data-time');
      
      // Only check for voice part within the current time section
      if (showVoicePart(currentTimeMatchingDiv)) {
        console.log('Found voice-part matching div:', divTime);
        if (divTime !== lastMatchedTimeRef.current) {
          setCurrentHtmlSection(currentTimeMatchingDiv.outerHTML);
          lastMatchedTimeRef.current = divTime;
          setError(null);
        }
      } else {
        // If no matching voice part, show the time-matched section anyway
        console.log('No voice-part match found, showing time-matched div:', divTime);
        if (divTime !== lastMatchedTimeRef.current) {
          setCurrentHtmlSection(currentTimeMatchingDiv.outerHTML);
          lastMatchedTimeRef.current = divTime;
          setError(null);
        }
      }
    } else if (currentTime === 0) {
      // For initial display, show the first div
      const firstDiv = divs[0];
      console.log('Setting initial div display');
      setCurrentHtmlSection(firstDiv.outerHTML);
      lastMatchedTimeRef.current = firstDiv.getAttribute('data-time');
      setError(null);
    } else {
      console.log('No matching div found for current time');
      setCurrentHtmlSection('');
      lastMatchedTimeRef.current = null;
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