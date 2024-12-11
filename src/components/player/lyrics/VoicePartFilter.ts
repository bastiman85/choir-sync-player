export const filterVoicePart = (element: Element, voiceInitial: string): Element => {
  // Return the element as-is without filtering
  return element;
};

export const showVoicePart = (element: Element, activeVoicePart: string | undefined): boolean => {
  // Always show all voice parts
  return true;
};