import { Track } from "@/types/song";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Volume2, VolumeX } from "lucide-react";

interface TrackControlsProps {
  track: Track;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
}

const TrackControls = ({
  track,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: TrackControlsProps) => {
  return (
    <div className="flex items-center gap-4">
      <span className="w-20 font-semibold">{track.voicePart}</span>
      <Button variant="ghost" size="icon" onClick={onMuteToggle}>
        {isMuted ? <VolumeX /> : <Volume2 />}
      </Button>
      <Slider
        value={[volume * 100]}
        onValueChange={(value) => onVolumeChange(value[0])}
        max={100}
        step={1}
        className="w-48"
      />
    </div>
  );
};

export default TrackControls;