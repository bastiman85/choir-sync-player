export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = element.outerHTML;
  
  // Remove unwanted voice parts while keeping the structure
  const unwantedBlocks = tempDiv.querySelectorAll(`.lattextblock:not(.${voiceInitial})`);
  unwantedBlocks.forEach(block => block.remove());
  
  // Remove empty multi-voice containers
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
    console.log('Showing all voice parts due to activeVoicePart:', activeVoicePart);
    return true;
  }

  const voiceInitial = activeVoicePart[0].toLowerCase();
  const lattextblocks = element.querySelectorAll('.lattextblock');
  console.log('Checking lattextblocks in current section:', lattextblocks.length);
  
  for (const block of lattextblocks) {
    const classes = Array.from(block.classList);
    console.log('Checking classes for voice part in section:', classes, 'looking for:', voiceInitial);
    
    if (classes.includes(voiceInitial)) {
      console.log('Found matching voice part in section');
      return true;
    }
  }
  
  console.log('No matching voice part found in section');
  return false;
};
