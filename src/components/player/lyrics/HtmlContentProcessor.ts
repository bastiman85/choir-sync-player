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
      if (divTime !== lastMatchedTimeRef.current) {
        // Don't filter if activeVoicePart is 'all' or 'instrumental'
        const shouldFilter = activeVoicePart && 
          activeVoicePart !== 'all' && 
          activeVoicePart !== 'instrumental';

        // Count active voice parts that are currently unmuted
        const activeParts = Array.from(currentSection.querySelectorAll('.lattextblock'))
          .filter(block => {
            // Get the voice part class (s, a, t, b)
            const voiceClass = Array.from(block.classList)
              .find(cls => ['s', 'a', 't', 'b'].includes(cls));
            
            // If this is the active voice part or if it's not a voice part block, count it
            return voiceClass === activeVoicePart?.[0].toLowerCase() || !voiceClass;
          })
          .length;

        // Only filter if we should filter AND there's only one active part
        const processedSection = (shouldFilter && activeParts <= 1) 
          ? filterVoicePart(currentSection, activeVoicePart[0].toLowerCase())
          : currentSection;
        
        setCurrentHtmlSection(processedSection.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    } else {
      if (divTime !== lastMatchedTimeRef.current) {
        setCurrentHtmlSection(currentSection.outerHTML);
        lastMatchedTimeRef.current = divTime;
        setError(null);
      }
    }
  } else if (currentTime === 0) {
    const firstDiv = divs[0];
    setCurrentHtmlSection(firstDiv.outerHTML);
    lastMatchedTimeRef.current = firstDiv.getAttribute('data-time');
    setError(null);
  } else {
    setCurrentHtmlSection('');
    lastMatchedTimeRef.current = null;
  }
};