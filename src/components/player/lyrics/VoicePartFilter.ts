export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = element.outerHTML;

  // If no specific voice part is active, or if it's not a single-letter voice part
  if (!voiceInitial || !['s', 'a', 't', 'b'].includes(voiceInitial.toLowerCase())) {
    return element;
  }

  // Find all lattextblock elements
  const textBlocks = tempDiv.querySelectorAll('.lattextblock');
  let hasRelevantContent = false;

  textBlocks.forEach(block => {
    // Check if this block contains the active voice part
    if (!block.classList.contains(voiceInitial.toLowerCase())) {
      block.remove();
    } else {
      hasRelevantContent = true;
    }
  });

  // If no relevant content was found in this section, return null to indicate the section should be hidden
  if (!hasRelevantContent) {
    return null;
  }

  // Clean up empty voice part containers
  const voiceContainers = tempDiv.querySelectorAll('.enstamma, .tvastammor, .trestammor, .fyrastammor');
  voiceContainers.forEach(container => {
    if (!container.querySelector('.lattextblock')) {
      container.remove();
    }
  });

  return tempDiv;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  // If no active voice part or if it's "all" or "instrumental", show everything
  if (!activeVoicePart || 
      activeVoicePart === 'all' || 
      activeVoicePart === 'instrumental') {
    return true;
  }

  // Get the first letter of the voice part (s, a, t, b)
  const voiceInitial = activeVoicePart[0].toLowerCase();

  // Only apply filtering for single voice parts (s, a, t, b)
  if (!['s', 'a', 't', 'b'].includes(voiceInitial)) {
    return true;
  }

  // Check if this section has any content for the active voice part
  const hasVoicePart = Array.from(element.querySelectorAll('.lattextblock'))
    .some(block => block.classList.contains(voiceInitial));

  return hasVoicePart;
};