import { Textarea } from "../ui/textarea";

interface LyricsInputProps {
  lyrics: string;
  onLyricsChange: (lyrics: string) => void;
}

const LyricsInput = ({ lyrics, onLyricsChange }: LyricsInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Sångtext med tidsstämplar (format: startTid,slutTid,text)
      </label>
      <Textarea
        value={lyrics}
        onChange={(e) => onLyricsChange(e.target.value)}
        placeholder="0,5,Första raden av sångtexten&#10;5,10,Andra raden av sångtexten"
        rows={10}
      />
    </div>
  );
};

export default LyricsInput;