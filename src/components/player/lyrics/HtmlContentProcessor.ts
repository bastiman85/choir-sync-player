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
  console.log('processHtmlContent called with voice part:', activeVoicePart);
  console.log('Current time:', currentTime);
  
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

  // First, clone all divs without any current-section class
  divs.forEach((div) => {
    const divClone = div.cloneNode(true) as Element;
    divClone.classList.remove('current-section'); // Ensure no section has the highlight class initially
    allSections.appendChild(divClone);
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

  // Apply voice part filtering if needed
  let finalContent: HTMLDivElement = allSections;
  if (activeVoicePart && activeVoicePart !== 'all') {
    console.log('Starting voice part filtering for:', activeVoicePart);
    console.log('Content before filtering:', allSections.outerHTML);
    const filteredContent = filterVoicePart(allSections, activeVoicePart);
    finalContent = filteredContent as HTMLDivElement;
    console.log('Content after filtering:', finalContent.outerHTML);
  } else {
    console.log('No filtering needed, using all sections');
  }

  if (currentSection) {
    const divTime = currentSection.getAttribute('data-time');
    if (divTime !== lastMatchedTimeRef.current) {
      console.log('Updating section with time:', divTime);
      setCurrentHtmlSection(finalContent.outerHTML);
      lastMatchedTimeRef.current = divTime;
      setError(null);
    }
  } else if (currentTime === 0) {
    console.log('Setting initial content');
    setCurrentHtmlSection(finalContent.outerHTML);
    lastMatchedTimeRef.current = divs[0].getAttribute('data-time');
    setError(null);
  } else {
    console.log('Setting content without current section');
    setCurrentHtmlSection(finalContent.outerHTML);
    lastMatchedTimeRef.current = null;
  }
};