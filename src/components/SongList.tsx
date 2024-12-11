import React from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Song } from "@/types/song";

interface SongListProps {
  songs: Song[];
}

const SongList = ({ songs }: SongListProps) => {
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSongClick = (song: Song) => {
    const slug = song.title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/player/${slug}`);
  };

  return (
    <div className="p-3 sm:p-4 max-w-2xl mx-auto">
      <Input
        type="search"
        placeholder="Search songs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <div className="space-y-2">
        {filteredSongs.map((song) => (
          <div
            key={song.id}
            onClick={() => handleSongClick(song)}
            className="p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900">{song.title}</h3>
            <div className="flex gap-2 mt-2">
              {song.tracks.map((track) => (
                <span
                  key={track.id}
                  className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                >
                  {track.voicePart}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongList;