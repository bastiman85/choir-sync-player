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

  // Find current section and show all sections
  let currentSection: Element | null = null;
  const allSections = document.createElement('div');

  divs.forEach((div) => {
    const divTime = div.getAttribute('data-time');
    const divClone = div.cloneNode(true) as Element;
    
    // Only highlight if this is the current section
    if (divTime && divTime <= timeString) {
      const nextDiv = Array.from(divs).find(d => {
        const nextTime = d.getAttribute('data-time');
        return nextTime && nextTime > timeString;
      });
      
      if (!nextDiv || (nextDiv.getAttribute('data-time') || '') > timeString) {
        divClone.classList.add('current-section');
        currentSection = divClone;
      }
    }
    
    allSections.appendChild(divClone);
  });

  if (currentSection) {
    const divTime = currentSection.getAttribute('data-time');
    if (divTime !== lastMatchedTimeRef.current) {
      setCurrentHtmlSection(allSections.innerHTML);
      lastMatchedTimeRef.current = divTime;
      setError(null);
    }
  } else if (currentTime === 0) {
    setCurrentHtmlSection(tempDiv.innerHTML);
    lastMatchedTimeRef.current = divs[0].getAttribute('data-time');
    setError(null);
  } else {
    setCurrentHtmlSection(tempDiv.innerHTML);
    lastMatchedTimeRef.current = null;
  }
};