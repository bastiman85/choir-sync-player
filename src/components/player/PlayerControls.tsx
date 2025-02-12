
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPauseClick: () => void;
  onSeek: (value: number[]) => void;
  currentTime: number;
}

const PlayerControls = ({
  isPlaying,
  onPlayPauseClick,
  onSeek,
  currentTime,
}: PlayerControlsProps) => {
  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 15);
    onSeek([newTime]);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 15;
    onSeek([newTime]);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between mb-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button onClick={handleSkipBack} variant="outline" size="icon" className="w-10 h-10">
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button onClick={onPlayPauseClick} variant="outline" className="w-full sm:w-auto">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">{isPlaying ? "Pausa" : "Spela"}</span>
        </Button>

        <Button onClick={handleSkipForward} variant="outline" size="icon" className="w-10 h-10">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerControls;
