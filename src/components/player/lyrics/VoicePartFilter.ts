export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  console.log('Filtering voice part:', voiceInitial);
  const clonedElement = element.cloneNode(true) as Element;
  
  if (voiceInitial === 'all') {
    console.log('Showing all voice parts');
    // Show all text blocks
    clonedElement.querySelectorAll('.lattextblock').forEach((block) => {
      (block as HTMLElement).style.display = 'flex';
    });
    return clonedElement;
  }

  const textBlocks = clonedElement.querySelectorAll('.lattextblock');
  console.log('Found text blocks:', textBlocks.length);
  
  textBlocks.forEach((block) => {
    console.log('Block classes:', block.classList.toString());
    // Check if block has the voice part class or if it's a combined part (s a t b)
    const isAllVoices = block.classList.contains('s') && 
                       block.classList.contains('a') && 
                       block.classList.contains('t') && 
                       block.classList.contains('b');
                       
    if (!block.classList.contains(voiceInitial.toLowerCase()) && !isAllVoices) {
      console.log('Hiding block for voice part:', voiceInitial);
      (block as HTMLElement).style.display = 'none';
    } else {
      console.log('Showing block for voice part:', voiceInitial);
      (block as HTMLElement).style.display = 'flex';
    }
  });

  return clonedElement;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  console.log('Checking visibility for voice part:', activeVoicePart);
  if (!activeVoicePart || activeVoicePart === 'all') {
    return true;
  }

  // Check if element has the voice part class or if it's a combined part
  const isAllVoices = element.classList.contains('s') && 
                     element.classList.contains('a') && 
                     element.classList.contains('t') && 
                     element.classList.contains('b');
                     
  const shouldShow = element.classList.contains(activeVoicePart.toLowerCase()) || isAllVoices;
  console.log('Should show element:', shouldShow);
  return shouldShow;
};