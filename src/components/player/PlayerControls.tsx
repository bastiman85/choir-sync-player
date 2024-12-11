import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Play, Pause } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  autoRestartSong: boolean;
  autoRestartChapter: boolean;
  onPlayPauseClick: () => void;
  onAutoRestartSongChange: (checked: boolean) => void;
  onAutoRestartChapterChange: (checked: boolean) => void;
  hasChapters: boolean;
}

const PlayerControls = ({
  isPlaying,
  autoRestartSong,
  autoRestartChapter,
  onPlayPauseClick,
  onAutoRestartSongChange,
  onAutoRestartChapterChange,
  hasChapters,
}: PlayerControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
      <Button onClick={onPlayPauseClick} variant="outline">
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="ml-2">{isPlaying ? "Pausa" : "Spela"}</span>
      </Button>

      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-2">
          <Switch
            checked={autoRestartSong}
            onCheckedChange={onAutoRestartSongChange}
          />
          <span className="text-sm">Upprepa sång</span>
        </label>

        {hasChapters && (
          <label className="flex items-center gap-2">
            <Switch
              checked={autoRestartChapter}
              onCheckedChange={onAutoRestartChapterChange}
            />
            <span className="text-sm">Upprepa del</span>
          </label>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;