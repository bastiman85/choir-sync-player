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

    let matchFound = false;
    let latestMatchingDiv: Element | null = null;
    let latestTimeMatchingDiv: Element | null = null;

    // Find the latest matching div based on time and voice part
    divs.forEach((div) => {
      const divTime = div.getAttribute('data-time');
      console.log('Checking div with time:', divTime, 'content:', div.textContent?.slice(0, 50));
      
      if (divTime && divTime <= timeString) {
        latestTimeMatchingDiv = div;
        console.log('Found time-matching div:', divTime);
        
        if (showVoicePart(div)) {
          latestMatchingDiv = div;
          matchFound = true;
          console.log('Found voice-part matching div:', divTime);
        }
      }
    });

    // If we found a matching div and it's different from the last one shown
    if (matchFound && latestMatchingDiv) {
      const divTime = latestMatchingDiv.getAttribute('data-time');
      if (divTime !== lastMatchedTimeRef.current) {
        console.log('Updating section with voice-part matching div:', divTime);
        setCurrentHtmlSection(latestMatchingDiv.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    } else if (latestTimeMatchingDiv) {
      // If no matching div for the voice part is found, show the time-matched div
      const divTime = latestTimeMatchingDiv.getAttribute('data-time');
      if (divTime !== lastMatchedTimeRef.current) {
        console.log('No voice-part match found, falling back to time-matched div:', divTime);
        setCurrentHtmlSection(latestTimeMatchingDiv.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    } else if (currentTime === 0) {
      // For initial display, find the first div that matches the voice part
      const firstShowableDiv = Array.from(divs).find(div => showVoicePart(div)) || divs[0];
      if (firstShowableDiv) {
        console.log('Setting initial div display');
        setCurrentHtmlSection(firstShowableDiv.outerHTML);
        lastMatchedTimeRef.current = firstShowableDiv.getAttribute('data-time');
        setError(null);
      } else {
        setCurrentHtmlSection('');
        lastMatchedTimeRef.current = null;
      }
    } else {
      // If no matching div is found, show nothing
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