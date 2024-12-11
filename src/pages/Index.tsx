import React, { useState } from "react";
import SongList from "@/components/SongList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Song, Choir } from "@/types/song";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// This would normally come from an API
const mockChoirs: Choir[] = [
  {
    id: "1",
    name: "St. Mary's Choir",
    description: "Traditional church choir"
  },
  {
    id: "2",
    name: "Community Singers",
    description: "Local community choir"
  }
];

// This would normally come from an API
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    choirId: "1",
    tracks: [
      { id: "1", voicePart: "soprano", url: "/path/to/soprano.mp3" },
      { id: "2", voicePart: "alto", url: "/path/to/alto.mp3" },
    ],
    lyrics: [
      { id: "1", text: "Amazing grace, how sweet the sound", startTime: 0, endTime: 5 },
      { id: "2", text: "That saved a wretch like me", startTime: 5, endTime: 10 },
    ],
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
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedChoirId, setSelectedChoirId] = useState<string>(mockChoirs[0].id);

  const filteredSongs = mockSongs.filter(song => song.choirId === selectedChoirId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Choir Practice App</h1>
            <div className="w-[250px]">
              <Select
                value={selectedChoirId}
                onValueChange={(value) => setSelectedChoirId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a choir" />
                </SelectTrigger>
                <SelectContent>
                  {mockChoirs.map((choir) => (
                    <SelectItem key={choir.id} value={choir.id}>
                      {choir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => navigate("/admin/songs/new")}>Add New Song</Button>
        </div>
        <SongList songs={filteredSongs} />
      </div>
    </div>
  );
};

export default Index;