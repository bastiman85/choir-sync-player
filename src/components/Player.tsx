import { Song } from "@/types/song";
import TrackControls from "./player/TrackControls";
import Scrubber from "./player/Scrubber";
import LyricsDisplay from "./player/LyricsDisplay";
import ChapterMarkers from "./player/ChapterMarkers";
import PlayerControls from "./player/PlayerControls";
import { useAudioManager } from "@/hooks/useAudioManager";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface PlayerProps {
  song: Song;
}

const Player = ({ song }: PlayerProps) => {
  const [showChapters, setShowChapters] = useState(false);
  const [activeVoicePart, setActiveVoicePart] = useState<string>('all');
  
  useEffect(() => {
    // Update page title
    document.title = song.title;
  }, [song.title]);

  const {
    isPlaying,
    currentTime,
    duration,
    volumes,
    mutedTracks,
    autoRestartSong,
    autoRestartChapter,
    setAutoRestartSong,
    setAutoRestartChapter,
    togglePlayPause,
    handleVolumeChange,
    handleMuteToggle,
    handleSeek,
  } = useAudioManager(song);

  const handleChapterClick = (time: number) => {
    handleSeek([time]);
    setShowChapters(false);
  };

  const handleVoicePartChange = (value: string) => {
    setActiveVoicePart(value === 'all' ? 'all' : value.toLowerCase());
  };

  const hasChapters = Boolean(song.chapters?.length);

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">{song.title}</h2>
      
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg">
        <div className={`grid grid-cols-1 ${hasChapters ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div className={`${hasChapters ? 'md:col-span-2' : 'md:col-span-2'} space-y-3 md:mt-8`}>
            {song.tracks.map((track) => (
              <TrackControls
                key={track.id}
                track={track}
                volume={volumes[track.id]}
                isMuted={mutedTracks[track.id]}
                onVolumeChange={(value) => handleVolumeChange(track.id, value)}
                onMuteToggle={() => handleMuteToggle(track.id)}
              />
            ))}
          </div>
          {hasChapters && (
            <div className="md:col-span-1">
              <div className="md:hidden">
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => setShowChapters(!showChapters)}
                >
                  Visa delar {showChapters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </div>
              <div className={`${showChapters ? 'block' : 'hidden'} md:block`}>
                <h3 className="text-sm font-medium mb-2 hidden md:block">Hoppa direkt</h3>
                <ChapterMarkers
                  chapters={song.chapters}
                  onChapterClick={handleChapterClick}
                  currentTime={currentTime}
                />
              </div>
            </div>
          )}
        </div>

        <div className="my-4">
          <Scrubber
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
        </div>

        <PlayerControls
          isPlaying={isPlaying}
          autoRestartSong={autoRestartSong}
          autoRestartChapter={autoRestartChapter}
          onPlayPauseClick={togglePlayPause}
          onAutoRestartSongChange={(checked) => {
            setAutoRestartSong(checked);
            if (checked) setAutoRestartChapter(false);
          }}
          onAutoRestartChapterChange={(checked) => {
            setAutoRestartChapter(checked);
            if (checked) setAutoRestartSong(false);
          }}
          hasChapters={hasChapters}
        />

        <div className="flex justify-center items-center gap-4 mt-6 mb-6">
          <ToggleGroup type="single" value={activeVoicePart} onValueChange={handleVoicePartChange}>
            <ToggleGroupItem 
              value="all" 
              className="voice-part-alla bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Alla
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="s" 
              className="voice-part-sopran bg-primary text-primary-foreground hover:bg-primary/90"
            >
              SOP
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="a" 
              className="voice-part-alt bg-primary text-primary-foreground hover:bg-primary/90"
            >
              ALT
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="t" 
              className="voice-part-tenor bg-primary text-primary-foreground hover:bg-primary/90"
            >
              TEN
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="b" 
              className="voice-part-bas bg-primary text-primary-foreground hover:bg-primary/90"
            >
              BAS
            </ToggleGroupItem>
          </ToggleGroup>

          {song.pdf_url && (
            <Button variant="outline" className="gap-2" onClick={() => window.open(song.pdf_url, '_blank')}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          )}
        </div>

        <LyricsDisplay 
          currentTime={currentTime} 
          lyrics={song.lyrics} 
          htmlContent={song.htmlContent}
          htmlFileUrl={song.html_file_url}
          activeVoicePart={activeVoicePart}
        />
      </div>
    </div>
  );
};

export default Player;
