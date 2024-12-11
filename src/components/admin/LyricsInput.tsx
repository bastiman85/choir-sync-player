import { Textarea } from "../ui/textarea";

interface LyricsInputProps {
  lyrics: string;
  onLyricsChange: (lyrics: string) => void;
}

const LyricsInput = ({ lyrics, onLyricsChange }: LyricsInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Lyrics with Timing (format: startTime,endTime,text)
      </label>
      <Textarea
        value={lyrics}
        onChange={(e) => onLyricsChange(e.target.value)}
        placeholder="0,5,First line of lyrics&#10;5,10,Second line of lyrics"
        rows={10}
      />
    </div>
  );
};

export default LyricsInput;