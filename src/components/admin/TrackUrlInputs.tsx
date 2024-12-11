import { Input } from "../ui/input";
import { Track, VoicePart } from "@/types/song";

interface TrackUrlInputsProps {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
}

const TrackUrlInputs = ({ tracks, onTracksChange }: TrackUrlInputsProps) => {
  const voiceParts: VoicePart[] = ["soprano", "alto", "tenor", "bass"];

  const handleUrlChange = (voicePart: VoicePart, url: string) => {
    const existingTrackIndex = tracks.findIndex((t) => t.voicePart === voicePart);
    const newTracks = [...tracks];

    if (existingTrackIndex >= 0) {
      newTracks[existingTrackIndex] = {
        ...newTracks[existingTrackIndex],
        url,
      };
    } else {
      newTracks.push({
        id: Math.random().toString(),
        voicePart,
        url,
      });
    }

    onTracksChange(newTracks);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Track URLs</label>
      <div className="grid grid-cols-2 gap-4">
        {voiceParts.map((part) => (
          <div key={part} className="space-y-2">
            <label className="block text-sm capitalize">{part}</label>
            <Input
              type="url"
              placeholder={`Enter ${part} track URL`}
              value={tracks.find((t) => t.voicePart === part)?.url || ""}
              onChange={(e) => handleUrlChange(part, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackUrlInputs;