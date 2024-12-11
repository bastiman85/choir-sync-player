export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = element.outerHTML;
  
  const unwantedBlocks = tempDiv.querySelectorAll(`.lattextblock:not(.${voiceInitial})`);
  unwantedBlocks.forEach(block => block.remove());
  
  const multiVoiceContainers = tempDiv.querySelectorAll('.trestammor, .tvastammor, .fyrastammor');
  multiVoiceContainers.forEach(container => {
    if (!container.querySelector('.lattextblock')) {
      container.remove();
    }
  });

  return tempDiv;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  if (!activeVoicePart || activeVoicePart === 'all' || activeVoicePart === 'instrumental') {
    return true;
  }

  // Count active voice parts
  const activeParts = Array.from(element.querySelectorAll('.lattextblock'))
    .filter(block => block.classList.length > 1) // Has more classes than just 'lattextblock'
    .length;

  // If multiple voice parts are present, show all
  if (activeParts > 1) {
    return true;
  }

  // Otherwise, filter by the active voice part
  const voiceInitial = activeVoicePart[0].toLowerCase();
  const lattextblocks = element.querySelectorAll('.lattextblock');
  
  for (const block of lattextblocks) {
    const classes = Array.from(block.classList);
    if (classes.includes(voiceInitial)) {
      return true;
    }
  }
  
  return false;
};
