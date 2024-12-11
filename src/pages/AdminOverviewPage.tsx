import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import { Song, Choir, ChoirSong } from "@/types/song";
import { toast } from "sonner";

// Mock data - would come from API in real app
const mockChoirs: Choir[] = [
  { id: "1", name: "St. Mary's Choir", description: "Traditional church choir" },
  { id: "2", name: "Community Singers", description: "Local community choir" },
];

const mockSongs: Song[] = [
  {
    id: "1",
    title: "Amazing Grace",
    choirId: "1",
    tracks: [],
    lyrics: [],
    chapters: [],
  },
  {
    id: "2",
    title: "Hallelujah",
    choirId: "2",
    tracks: [],
    lyrics: [],
    chapters: [],
  },
];

const mockChoirSongs: ChoirSong[] = [
  { id: "1", choirId: "1", songId: "1" },
  { id: "2", choirId: "2", songId: "2" },
];

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const [selectedChoirId, setSelectedChoirId] = useState<string>(mockChoirs[0].id);

  const choirSongs = mockChoirSongs
    .filter((cs) => cs.choirId === selectedChoirId)
    .map((cs) => mockSongs.find((s) => s.id === cs.songId))
    .filter((s): s is Song => s !== undefined);

  const availableSongs = mockSongs.filter(
    (song) => !mockChoirSongs.some((cs) => cs.choirId === selectedChoirId && cs.songId === song.id)
  );

  const handleAddExistingSong = (songId: string) => {
    // In a real app, this would make an API call
    toast.success("Song added to choir successfully!");
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Choir Songs Management</h1>
          <div className="w-[250px]">
            <Select value={selectedChoirId} onValueChange={setSelectedChoirId}>
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
        <div className="space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Song
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate("/admin/songs/new")}>
                Create New Song
              </DropdownMenuItem>
              {availableSongs.map((song) => (
                <DropdownMenuItem
                  key={song.id}
                  onClick={() => handleAddExistingSong(song.id)}
                >
                  Add "{song.title}"
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {choirSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.title}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          // In a real app, this would make an API call
                          toast.success("Song removed from choir!");
                        }}
                      >
                        Remove from Choir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOverviewPage;