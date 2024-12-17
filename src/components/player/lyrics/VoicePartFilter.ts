export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  console.log('filterVoicePart called with voice part:', voiceInitial);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(element.outerHTML, 'text/html');
  const clonedElement = doc.body.firstChild as Element;
  
  if (voiceInitial === 'all') {
    console.log('Returning all voice parts');
    return clonedElement;
  }

  console.log('Processing sections for voice part:', voiceInitial);
  
  // First, hide all sections that don't contain the selected voice part
  const sections = clonedElement.querySelectorAll('[data-time]');
  console.log('Found sections:', sections.length);
  
  sections.forEach((section) => {
    const hasVoicePart = section.querySelector(`.lattextblock.${voiceInitial.toLowerCase()}, .lattextblock.${voiceInitial.toLowerCase()}.b, .lattextblock.s.a.t.b`);
    console.log('Section has voice part:', Boolean(hasVoicePart));
    
    if (!hasVoicePart) {
      (section as HTMLElement).style.cssText = 'display: none !important';
    } else {
      // For sections that have the voice part, hide other voice parts
      const textBlocks = section.querySelectorAll('.lattextblock');
      textBlocks.forEach((block) => {
        const isAllVoices = block.classList.contains('s') && 
                           block.classList.contains('a') && 
                           block.classList.contains('t') && 
                           block.classList.contains('b');
        
        const isRelevantBlock = block.classList.contains(voiceInitial.toLowerCase()) || isAllVoices;
        console.log('Block classes:', block.classList.toString());
        console.log('Is relevant block:', isRelevantBlock);
        
        if (!isRelevantBlock) {
          (block as HTMLElement).style.cssText = 'display: none !important';
        } else {
          (block as HTMLElement).style.cssText = 'display: flex !important';
        }
      });
    }
  });

  // Create a new document with the modified content
  const finalDoc = parser.parseFromString(clonedElement.outerHTML, 'text/html');
  console.log('Final filtered HTML content:', finalDoc.body.innerHTML);
  return finalDoc.body.firstChild as Element;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  console.log('showVoicePart called with voice part:', activeVoicePart);
  
  if (!activeVoicePart || activeVoicePart === 'all') {
    return true;
  }

  const isAllVoices = element.classList.contains('s') && 
                     element.classList.contains('a') && 
                     element.classList.contains('t') && 
                     element.classList.contains('b');
                      
  return element.classList.contains(activeVoicePart.toLowerCase()) || isAllVoices;
};