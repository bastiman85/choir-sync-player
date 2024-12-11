export const processHtmlContent = (
  html: string,
  currentTime: number,
  activeVoicePart: string | undefined,
  lastMatchedTimeRef: React.MutableRefObject<string | null>,
  setCurrentHtmlSection: (html: string) => void,
  setError: (error: string | null) => void,
  filterVoicePart: (element: Element, voiceInitial: string) => Element | null,
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

  // First, clone all divs and filter them based on voice part
  divs.forEach((div) => {
    if (activeVoicePart && ['soprano', 'alto', 'tenor', 'bass'].includes(activeVoicePart)) {
      const voiceInitial = activeVoicePart[0].toLowerCase();
      const filteredDiv = filterVoicePart(div, voiceInitial);
      
      // Only add the div if it has content for the active voice part
      if (filteredDiv && showVoicePart(div, activeVoicePart)) {
        const divClone = filteredDiv.cloneNode(true) as Element;
        divClone.classList.remove('current-section');
        allSections.appendChild(divClone);
      }
    } else {
      const divClone = div.cloneNode(true) as Element;
      divClone.classList.remove('current-section');
      allSections.appendChild(divClone);
    }
  });

  // Then find and highlight the current section
  const allClonedDivs = allSections.querySelectorAll('[data-time]');
  allClonedDivs.forEach((div, index) => {
    const divTime = div.getAttribute('data-time');
    if (divTime && divTime <= timeString) {
      const nextDiv = allClonedDivs[index + 1];
      const nextTime = nextDiv?.getAttribute('data-time');
      
      if (!nextDiv || (nextTime && timeString < nextTime)) {
        div.classList.add('current-section');
        currentSection = div;
      }
    }
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
    setCurrentHtmlSection(allSections.innerHTML);
    lastMatchedTimeRef.current = null;
  }
};