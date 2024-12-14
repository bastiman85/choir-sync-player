export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  const clonedElement = element.cloneNode(true) as Element;
  
  if (voiceInitial === 'all') {
    return clonedElement;
  }

  const textBlocks = clonedElement.querySelectorAll('.lattextblock');
  textBlocks.forEach((block) => {
    if (!block.classList.contains(voiceInitial.toLowerCase())) {
      (block as HTMLElement).style.display = 'none';
    } else {
      (block as HTMLElement).style.display = 'flex';
    }
  });

  return clonedElement;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  if (!activeVoicePart || activeVoicePart === 'all') {
    return true;
  }

  return element.classList.contains(activeVoicePart.toLowerCase());
};