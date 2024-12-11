import { Slider } from "../ui/slider";

interface ScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const Scrubber = ({ currentTime, duration, onSeek }: ScrubberProps) => {
  return (
    <div className="space-y-2">
      <Slider
        value={[currentTime]}
        onValueChange={onSeek}
        max={duration}
        step={0.1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Scrubber;