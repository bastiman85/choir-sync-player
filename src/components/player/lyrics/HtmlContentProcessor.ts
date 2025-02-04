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
    // Only process on initial load
    if (!document.querySelector('.lyrics-display')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      setCurrentHtmlSection(tempDiv.innerHTML);
    }

    // Get all timed sections directly from the DOM
    const divs = document.querySelectorAll('[data-time]');
    
    if (divs.length === 0) {
      setError('No timed sections found in the HTML content');
      return;
    }

    // Remove current-section class from all divs first
    divs.forEach(div => {
      div.classList.remove('current-section');
    });

    // Calculate current time string
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    const timeString = `${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
    
    // Find and update the current section
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