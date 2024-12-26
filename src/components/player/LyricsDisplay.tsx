import { LyricLine } from "@/types/song";
import { useEffect, useState } from "react";
import { processHtmlContent } from "./lyrics/HtmlContentProcessor";
import { filterVoicePart, showVoicePart } from "./lyrics/VoicePartFilter";
import { getCurrentLyric } from "./lyrics/LyricsProcessor";
import { PlainLyricsView } from "./lyrics/PlainLyricsView";
import { HtmlLyricsView } from "./lyrics/HtmlLyricsView";

interface LyricsDisplayProps {
  currentTime: number;
  lyrics: LyricLine[];
  htmlContent?: string;
  htmlFileUrl?: string;
  activeVoicePart?: string;
}

const LyricsDisplay = ({ currentTime, lyrics, htmlContent, htmlFileUrl, activeVoicePart }: LyricsDisplayProps) => {
  const [currentHtmlSection, setCurrentHtmlSection] = useState<string | null>(null);
  const lastMatchedTimeRef = { current: null };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!htmlContent && !htmlFileUrl) return;

    const processContent = async () => {
      try {
        const contentToProcess = htmlFileUrl || htmlContent;
        
        if (!contentToProcess) {
          setError('Inget HTML-innehåll tillgängligt');
          return;
        }

        if (contentToProcess.startsWith('blob:') || contentToProcess.startsWith('http')) {
          try {
            const response = await fetch(contentToProcess);
            if (!response.ok) {
              throw new Error(`Kunde inte hämta HTML-innehållet: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            processHtmlContent(
              html,
              currentTime,
              activeVoicePart,
              lastMatchedTimeRef,
              setCurrentHtmlSection,
              setError,
              filterVoicePart,
              showVoicePart
            );
          } catch (err) {
            console.error('Error fetching HTML content:', err);
            setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av innehållet');
            return;
          }
        } else {
          // Handle inline HTML content
          processHtmlContent(
            contentToProcess,
            currentTime,
            activeVoicePart,
            lastMatchedTimeRef,
            setCurrentHtmlSection,
            setError,
            filterVoicePart,
            showVoicePart
          );
        }
      } catch (err) {
        console.error('Error processing HTML content:', err);
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid bearbetning av innehållet');
      }
    };

    processContent();
  }, [currentTime, htmlContent, htmlFileUrl, activeVoicePart]);

  const currentLyric = getCurrentLyric(currentTime, lyrics);

  return (
    <div className="rounded-lg min-h-[100px] flex items-center justify-center">
      {(htmlContent || htmlFileUrl) ? (
        <div className="w-full">
          <HtmlLyricsView htmlContent={currentHtmlSection || ''} error={error} />
        </div>
      ) : (
        <PlainLyricsView currentLyric={currentLyric} />
      )}
    </div>
  );
};

export default LyricsDisplay;