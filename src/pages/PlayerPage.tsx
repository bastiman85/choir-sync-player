import React from "react";
import { useParams } from "react-router-dom";
import Player from "@/components/Player";
import { Song } from "@/types/song";

// This would normally come from an API
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    choirId: "1",
    tracks: [
      { id: "1", voicePart: "soprano", url: "/path/to/soprano.mp3" },
      { id: "2", voicePart: "alto", url: "/path/to/alto.mp3" },
      { id: "3", voicePart: "instrumental", url: "/path/to/instrumental.mp3" },
    ],
    lyrics: [
      { id: "1", text: "Amazing grace, how sweet the sound", startTime: 0, endTime: 5 },
      { id: "2", text: "That saved a wretch like me", startTime: 5, endTime: 10 },
    ],
    chapters: []
  },
  {
    id: "2",
    title: "Hallelujah",
    choirId: "2",
    tracks: [
      { id: "3", voicePart: "soprano", url: "/path/to/soprano.mp3" },
      { id: "4", voicePart: "alto", url: "/path/to/alto.mp3" },
    ],
    lyrics: [
      { id: "3", text: "Hallelujah, Hallelujah", startTime: 0, endTime: 5 },
      { id: "4", text: "Hallelujah, Hallelujah", startTime: 5, endTime: 10 },
    ],
    chapters: []
  },
];

const PlayerPage = () => {
  const { id } = useParams();
  const song = mockSongs.find((s) => s.id === id);

  if (!song) {
    return <div>Song not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <Player song={song} />
      </div>
    </div>
  );
};

export default PlayerPage;