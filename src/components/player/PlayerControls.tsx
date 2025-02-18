
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onSkipForward: () => void;
  onSkipBack: () => void;
  currentTime: number;
  autoRestartSong: boolean;
  onAutoRestartToggle: (checked: boolean) => void;
}

const PlayerControls = ({
  isPlaying,
  onPlayPauseClick,
  onSkipForward,
  onSkipBack,
  currentTime,
  autoRestartSong,
  onAutoRestartToggle,
}: PlayerControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button onClick={onSkipBack} variant="outline" size="icon" className="w-10 h-10">
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button onClick={onPlayPauseClick} variant="outline" className="w-full sm:w-auto">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">{isPlaying ? "Pausa" : "Spela"}</span>
        </Button>

        <Button onClick={onSkipForward} variant="outline" size="icon" className="w-10 h-10">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={autoRestartSong}
            onCheckedChange={onAutoRestartToggle}
            id="auto-restart"
          />
          <label htmlFor="auto-restart" className="text-sm text-gray-600">
            Upprepa
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
