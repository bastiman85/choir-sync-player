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

  // Remove current-section class from all divs first
  divs.forEach(div => {
    div.classList.remove('current-section');
  });

  // Find the current section
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

  setCurrentHtmlSection(tempDiv.innerHTML);
  setError(null);
};