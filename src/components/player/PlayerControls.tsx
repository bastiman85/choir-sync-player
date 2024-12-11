import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface PlayerControlsProps {
  isPlaying: boolean;
  autoRestartSong: boolean;
  autoRestartChapter: boolean;
  onPlayPauseClick: () => void;
  onAutoRestartSongChange: (checked: boolean) => void;
  onAutoRestartChapterChange: (checked: boolean) => void;
  hasChapters?: boolean;
}

const PlayerControls = ({
  isPlaying,
  autoRestartSong,
  autoRestartChapter,
  onPlayPauseClick,
  onAutoRestartSongChange,
  onAutoRestartChapterChange,
  hasChapters = false,
}: PlayerControlsProps) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <Button
        onClick={onPlayPauseClick}
        className="w-full"
        variant="default"
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-restart-song"
            checked={autoRestartSong}
            onCheckedChange={(checked) => {
              onAutoRestartSongChange(checked);
            }}
          />
          <Label htmlFor="auto-restart-song">Auto-restart song</Label>
        </div>

        {hasChapters && (
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-restart-chapter"
              checked={autoRestartChapter}
              onCheckedChange={(checked) => {
                onAutoRestartChapterChange(checked);
              }}
            />
            <Label htmlFor="auto-restart-chapter">Auto-restart chapter</Label>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerControls;