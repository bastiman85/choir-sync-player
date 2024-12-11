import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MoreHorizontal } from "lucide-react";
import { Song, Choir, ChoirSong } from "@/types/song";
import { toast } from "sonner";
import ChoirSelector from "@/components/admin/ChoirSelector";
import AddChoirModal from "@/components/admin/AddChoirModal";

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
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [isAddChoirModalOpen, setIsAddChoirModalOpen] = useState(false);

  const choirSongs = mockChoirSongs
    .filter((cs) => cs.choirId === selectedChoirId)
    .map((cs) => mockSongs.find((s) => s.id === cs.songId))
    .filter((s): s is Song => s !== undefined);

  const availableSongs = mockSongs.filter(
    (song) => !mockChoirSongs.some((cs) => cs.choirId === selectedChoirId && cs.songId === song.id)
  );

  const handleAddSelectedSongs = () => {
    toast.success(`${selectedSongs.length} songs added to choir successfully!`);
    setIsAddSongsDialogOpen(false);
    setSelectedSongs([]);
  };

  const handleAddChoir = (choirName: string) => {
    // In a real app, this would make an API call to create the choir
    toast.success(`New choir "${choirName}" created successfully!`);
    setIsAddChoirModalOpen(false);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Choir Songs Management</h1>
          <ChoirSelector
            choirs={mockChoirs}
            selectedChoirId={selectedChoirId}
            onChoirSelect={setSelectedChoirId}
            onAddChoir={() => setIsAddChoirModalOpen(true)}
          />
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => setIsAddSongsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Existing Song
          </Button>
          <Button onClick={() => navigate("/admin/songs/new")}>
            Create New Song
          </Button>
        </div>
      </div>

      <Dialog open={isAddSongsDialogOpen} onOpenChange={setIsAddSongsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Existing Songs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableSongs.map((song) => (
              <div key={song.id} className="flex items-center space-x-2">
                <Checkbox
                  id={song.id}
                  checked={selectedSongs.includes(song.id)}
                  onCheckedChange={(checked) => {
                    setSelectedSongs(
                      checked
                        ? [...selectedSongs, song.id]
                        : selectedSongs.filter((id) => id !== song.id)
                    );
                  }}
                />
                <label
                  htmlFor={song.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {song.title}
                </label>
              </div>
            ))}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddSongsDialogOpen(false);
                  setSelectedSongs([]);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSelectedSongs} disabled={selectedSongs.length === 0}>
                Add Selected Songs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddChoirModal
        isOpen={isAddChoirModalOpen}
        onClose={() => setIsAddChoirModalOpen(false)}
        onSubmit={handleAddChoir}
      />

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
