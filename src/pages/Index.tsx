import React from "react";
import SongList from "@/components/SongList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Song } from "@/types/song";

// This would normally come from an API
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    tracks: [
      { id: "1", voicePart: "soprano", url: "/path/to/soprano.mp3" },
      { id: "2", voicePart: "alto", url: "/path/to/alto.mp3" },
    ],
    lyrics: [
      { id: "1", text: "Amazing grace, how sweet the sound", startTime: 0, endTime: 5 },
      { id: "2", text: "That saved a wretch like me", startTime: 5, endTime: 10 },
    ],
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Choir Practice App</h1>
          <Button onClick={() => navigate("/admin/songs/new")}>Add New Song</Button>
        </div>
        <SongList songs={mockSongs} />
      </div>
    </div>
  );
};

export default Index;