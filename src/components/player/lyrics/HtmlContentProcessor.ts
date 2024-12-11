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
        // Show all text if:
        // 1. activeVoicePart is 'all' or 'instrumental'
        // 2. No active voice part is set
        // 3. Multiple voice parts are active
        const shouldShowAllText = 
          !activeVoicePart || 
          activeVoicePart === 'all' || 
          activeVoicePart === 'instrumental';

        // Get all voice parts in the current section
        const voiceParts = Array.from(currentSection.querySelectorAll('.lattextblock'))
          .map(block => {
            const classes = Array.from(block.classList);
            return classes.find(cls => ['s', 'a', 't', 'b'].includes(cls));
          })
          .filter(Boolean);

        const uniqueVoiceParts = new Set(voiceParts);
        const hasMultipleVoiceParts = uniqueVoiceParts.size > 1;

        // Filter text only when:
        // 1. We have a single voice part (s, a, t, b) active
        // 2. It's not the 'all' or 'instrumental' track
        // 3. There aren't multiple voice parts playing
        const shouldFilter = !shouldShowAllText && 
                           activeVoicePart && 
                           ['soprano', 'alto', 'tenor', 'bass'].includes(activeVoicePart) &&
                           !hasMultipleVoiceParts;

        const processedSection = shouldFilter
          ? filterVoicePart(currentSection.cloneNode(true) as Element, activeVoicePart[0].toLowerCase())
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