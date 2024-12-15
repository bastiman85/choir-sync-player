export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  console.log('Filtering voice part:', voiceInitial);
  const parser = new DOMParser();
  const doc = parser.parseFromString(element.outerHTML, 'text/html');
  const clonedElement = doc.body.firstChild as Element;
  
  if (voiceInitial === 'all') {
    console.log('Showing all voice parts');
    return clonedElement;
  }

  const textBlocks = clonedElement.querySelectorAll('.lattextblock');
  console.log('Found text blocks:', textBlocks.length);
  
  textBlocks.forEach((block) => {
    console.log('Processing block:', block.classList.toString());
    const isAllVoices = block.classList.contains('s') && 
                       block.classList.contains('a') && 
                       block.classList.contains('t') && 
                       block.classList.contains('b');
    
    if (!block.classList.contains(voiceInitial.toLowerCase()) && !isAllVoices) {
      console.log('Hiding block for voice part:', voiceInitial);
      (block as HTMLElement).style.cssText = 'display: none !important';
    } else {
      console.log('Showing block for voice part:', voiceInitial);
      (block as HTMLElement).style.cssText = 'display: flex !important';
    }
  });

  return clonedElement;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  if (!activeVoicePart || activeVoicePart === 'all') {
    return true;
  }

  const isAllVoices = element.classList.contains('s') && 
                     element.classList.contains('a') && 
                     element.classList.contains('t') && 
                     element.classList.contains('b');
                     
  return element.classList.contains(activeVoicePart.toLowerCase()) || isAllVoices;
};