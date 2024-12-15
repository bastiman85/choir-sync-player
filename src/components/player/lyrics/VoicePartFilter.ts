export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(element.outerHTML, 'text/html');
  const clonedElement = doc.body.firstChild as Element;
  
  if (voiceInitial === 'all') {
    return clonedElement;
  }

  // First, hide all sections that don't contain the selected voice part
  const sections = clonedElement.querySelectorAll('[data-time]');
  sections.forEach((section) => {
    const hasVoicePart = section.querySelector(`.lattextblock.${voiceInitial.toLowerCase()}, .lattextblock.${voiceInitial.toLowerCase()}.b, .lattextblock.s.a.t.b`);
    if (!hasVoicePart) {
      (section as HTMLElement).style.cssText = 'display: none !important';
    }
  });

  // Then, within visible sections, hide text blocks that don't match the voice part
  const textBlocks = clonedElement.querySelectorAll('.lattextblock');
  textBlocks.forEach((block) => {
    const isAllVoices = block.classList.contains('s') && 
                       block.classList.contains('a') && 
                       block.classList.contains('t') && 
                       block.classList.contains('b');
    
    const isRelevantBlock = block.classList.contains(voiceInitial.toLowerCase()) || 
                           (block.classList.contains(voiceInitial.toLowerCase()) && block.classList.contains('b')) ||
                           isAllVoices;
    
    if (!isRelevantBlock) {
      (block as HTMLElement).style.cssText = 'display: none !important';
    } else {
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