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

  // Find current section
  divs.forEach((div) => {
    div.classList.remove('current-section');
    const divTime = div.getAttribute('data-time');
    if (divTime && divTime <= timeString) {
      const nextDiv = Array.from(divs).find(d => {
        const nextTime = d.getAttribute('data-time');
        return nextTime && nextTime > timeString;
      });
      
      if (!nextDiv) {
        div.classList.add('current-section');
      }
    }
  });

  if (currentTime === 0) {
    divs[0].classList.add('current-section');
  }

  setCurrentHtmlSection(tempDiv.innerHTML);
  setError(null);
};