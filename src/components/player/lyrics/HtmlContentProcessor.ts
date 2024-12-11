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
  
  console.log('Processing HTML content for time:', timeString, 'activeVoicePart:', activeVoicePart);
  
  const divs = tempDiv.querySelectorAll('[data-time]');
  
  if (divs.length === 0) {
    setError('No timed sections found in the HTML content');
    return;
  }

  // Find the current time section
  let currentSection: Element | null = null;

  for (let i = 0; i < divs.length; i++) {
    const div = divs[i];
    const divTime = div.getAttribute('data-time');
    const nextDiv = divs[i + 1];
    const nextDivTime = nextDiv?.getAttribute('data-time');

    if (divTime && divTime <= timeString && (!nextDivTime || nextDivTime > timeString)) {
      currentSection = div;
      break;
    }
  }

  if (currentSection) {
    const divTime = currentSection.getAttribute('data-time');
    
    if (showVoicePart(currentSection, activeVoicePart)) {
      console.log('Found voice-part match in current section:', divTime);
      if (divTime !== lastMatchedTimeRef.current) {
        // Filter the content to show only the matching voice part
        const filteredSection = activeVoicePart && 
          activeVoicePart !== 'all' && 
          activeVoicePart !== 'instrumental' 
            ? filterVoicePart(currentSection, activeVoicePart[0].toLowerCase())
            : currentSection;
        
        setCurrentHtmlSection(filteredSection.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    } else {
      console.log('No voice-part match in current section, showing anyway:', divTime);
      if (divTime !== lastMatchedTimeRef.current) {
        setCurrentHtmlSection(currentSection.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    }
  } else if (currentTime === 0) {
    const firstDiv = divs[0];
    console.log('Setting initial div display');
    setCurrentHtmlSection(firstDiv.outerHTML);
    lastMatchedTimeRef.current = firstDiv.getAttribute('data-time');
    setError(null);
  } else {
    console.log('No matching section found for current time');
    setCurrentHtmlSection('');
    lastMatchedTimeRef.current = null;
  }
};