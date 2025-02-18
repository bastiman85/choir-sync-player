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
  const voicePartLabels: Record<string, string> = {
    soprano: "Sopran",
    alto: "Alt",
    tenor: "Tenor",
    bass: "Bas",
    instrumental: "Instrumental",
    all: "Alla"
  };

  return (
    <div className="flex items-center gap-4">
      <span className="w-20 font-semibold">{voicePartLabels[track.voicePart] || track.voicePart}</span>
      <Button variant="ghost" size="icon" onClick={onMuteToggle}>
        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>
      <Slider
        value={[volume * 100]}
        onValueChange={(value) => onVolumeChange(value[0])}
        max={100}
        step={1}
        className="w-48"
        disabled={isMuted}
      />
    </div>
  );
};

export default TrackControls;