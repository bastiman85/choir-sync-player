
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onSeek: (value: number[]) => void;
  currentTime: number;
  autoRestartSong: boolean;
  onAutoRestartToggle: (checked: boolean) => void;
  hasChapters: boolean;
  autoRestartChapter: boolean;
  onAutoRestartChapterToggle: (checked: boolean) => void;
}

const PlayerControls = ({
  isPlaying,
  onPlayPauseClick,
  onSeek,
  currentTime,
  autoRestartSong,
  onAutoRestartToggle,
  hasChapters,
  autoRestartChapter,
  onAutoRestartChapterToggle,
}: PlayerControlsProps) => {
  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    onSeek([newTime]);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 10;
    onSeek([newTime]);
  };

  const handleRestartSongToggle = (checked: boolean) => {
    if (checked && autoRestartChapter) {
      onAutoRestartChapterToggle(false);
    }
    onAutoRestartToggle(checked);
  };

  const handleRestartChapterToggle = (checked: boolean) => {
    if (checked && autoRestartSong) {
      onAutoRestartToggle(false);
    }
    onAutoRestartChapterToggle(checked);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button onClick={handleSkipBack} variant="outline" size="icon" className="w-10 h-10">
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button onClick={onPlayPauseClick} variant="outline" className="w-full sm:w-auto">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">{isPlaying ? "Pausa" : "Spela"}</span>
        </Button>

        <Button onClick={handleSkipForward} variant="outline" size="icon" className="w-10 h-10">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={autoRestartSong}
            onCheckedChange={handleRestartSongToggle}
            id="auto-restart"
          />
          <label htmlFor="auto-restart" className="text-sm text-gray-600">
            Upprepa
          </label>
        </div>

        {hasChapters && (
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRestartChapter}
              onCheckedChange={handleRestartChapterToggle}
              id="auto-restart-chapter"
            />
            <label htmlFor="auto-restart-chapter" className="text-sm text-gray-600">
              Upprepa del
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;
