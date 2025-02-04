export const processHtmlContent = (
  html: string,
  currentTime: number,
  activeVoicePart: string | undefined,
  lastMatchedTimeRef: React.MutableRefObject<string | null>,
  setCurrentHtmlSection: (html: string) => void,
  setError: (error: string | null) => void,
  filterVoicePart: (element: Element, voiceInitial: string) => Element,
  showVoicePart: (element: Element, activeVoicePart: string | undefined) => boolean
) => {
  try {
    // Initial load of HTML content
    if (!lastMatchedTimeRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      setCurrentHtmlSection(tempDiv.innerHTML);
      lastMatchedTimeRef.current = '0000';
    }

    // Get all sections with data-time attributes from the live DOM
    const lyricsDisplay = document.querySelector('.lyrics-display');
    if (!lyricsDisplay) {
      console.error('Lyrics display container not found');
      return;
    }

    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
    
    const divs = lyricsDisplay.querySelectorAll('[data-time]');
    
    if (divs.length === 0) {
      setError('No timed sections found in the HTML content');
      return;
    }

    // Remove current-section class from all divs first
    divs.forEach(div => {
      div.classList.remove('current-section');
    });

    // Find and highlight the current section
    let currentDiv = null;
    for (const div of divs) {
      const divTime = div.getAttribute('data-time');
      if (divTime && divTime <= timeString) {
        currentDiv = div;
      } else {
        break;
      }
    }

    // Add current-section class to the found div
    if (currentDiv) {
      currentDiv.classList.add('current-section');
    } else if (currentTime === 0 && divs.length > 0) {
      // If at the start, highlight first section
      divs[0].classList.add('current-section');
    }

    setError(null);
  } catch (err) {
    console.error('Error processing HTML content:', err);
    setError('Ett fel uppstod vid bearbetning av HTML-innehållet');
  }
};