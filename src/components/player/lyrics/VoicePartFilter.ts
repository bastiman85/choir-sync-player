export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  console.log('Filtering voice part:', voiceInitial);
  const clonedElement = element.cloneNode(true) as Element;
  
  if (voiceInitial === 'all') {
    console.log('Showing all voice parts');
    return clonedElement;
  }

  const textBlocks = clonedElement.querySelectorAll('.lattextblock');
  console.log('Found text blocks:', textBlocks.length);
  
  textBlocks.forEach((block) => {
    console.log('Block classes:', block.classList.toString());
    if (!block.classList.contains(voiceInitial.toLowerCase())) {
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

  const shouldShow = element.classList.contains(activeVoicePart.toLowerCase());
  console.log('Should show element:', shouldShow);
  return shouldShow;
};