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
    <div className="flex flex-col gap-4 mb-4">
      <Button 
        onClick={onPlayPauseClick} 
        variant="outline"
        className="bg-white text-black hover:bg-gray-100 border-gray-200 w-full"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="ml-2">{isPlaying ? "Pausa" : "Spela"}</span>
      </Button>

      <div className="flex flex-col gap-4">
        <label className="flex items-center justify-between gap-2">
          <span className="text-sm">Upprepa sång</span>
          <Switch
            checked={autoRestartSong}
            onCheckedChange={onAutoRestartSongChange}
          />
        </label>

        {hasChapters && (
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm">Upprepa del</span>
            <Switch
              checked={autoRestartChapter}
              onCheckedChange={onAutoRestartChapterChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;