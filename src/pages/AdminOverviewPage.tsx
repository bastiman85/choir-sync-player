import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MoreHorizontal } from "lucide-react";
import { Song, Choir } from "@/types/song";
import { toast } from "sonner";
import ChoirSelector from "@/components/admin/ChoirSelector";
import AddChoirModal from "@/components/admin/AddChoirModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [isAddChoirModalOpen, setIsAddChoirModalOpen] = useState(false);

  // Fetch choirs
  const { data: choirs = [] } = useQuery({
    queryKey: ['choirs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('choirs')
        .select('*');
      if (error) throw error;
      return data as Choir[];
    }
  });

  const [selectedChoirId, setSelectedChoirId] = useState<string>(choirs[0]?.id || '');

  // Fetch songs for selected choir
  const { data: choirSongs = [] } = useQuery({
    queryKey: ['songs', selectedChoirId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `)
        .eq('choir_id', selectedChoirId);
      if (error) throw error;
      return data.map(song => ({
        id: song.id,
        title: song.title,
        choirId: song.choir_id,
        tracks: song.tracks.map((track: any) => ({
          id: track.id,
          url: track.url,
          voicePart: track.voice_part
        })),
        lyrics: song.lyrics.map((lyric: any) => ({
          id: lyric.id,
          text: lyric.text,
          startTime: lyric.start_time,
          endTime: lyric.end_time
        })),
        chapters: song.chapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          time: chapter.start_time,
          type: "verse" as const
        }))
      })) as Song[];
    },
    enabled: !!selectedChoirId
  });

  // Fetch available songs (songs not in the selected choir)
  const { data: availableSongs = [] } = useQuery({
    queryKey: ['available-songs', selectedChoirId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `)
        .is('choir_id', null);
      if (error) throw error;
      return data.map(song => ({
        id: song.id,
        title: song.title,
        choirId: song.choir_id,
        tracks: song.tracks.map((track: any) => ({
          id: track.id,
          url: track.url,
          voicePart: track.voice_part
        })),
        lyrics: song.lyrics.map((lyric: any) => ({
          id: lyric.id,
          text: lyric.text,
          startTime: lyric.start_time,
          endTime: lyric.end_time
        })),
        chapters: song.chapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          time: chapter.start_time,
          type: "verse" as const
        }))
      })) as Song[];
    },
    enabled: !!selectedChoirId
  });

  const addSongsToChoir = useMutation({
    mutationFn: async (songIds: string[]) => {
      const { error } = await supabase
        .from('songs')
        .update({ choir_id: selectedChoirId })
        .in('id', songIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', selectedChoirId] });
      queryClient.invalidateQueries({ queryKey: ['available-songs', selectedChoirId] });
      toast.success(`${selectedSongs.length} songs added to choir successfully!`);
      setIsAddSongsDialogOpen(false);
      setSelectedSongs([]);
    },
    onError: (error) => {
      toast.error('Failed to add songs to choir');
      console.error('Error adding songs to choir:', error);
    }
  });

  // Mutation to add new choir
  const addChoir = useMutation({
    mutationFn: async (choirName: string) => {
      const { error } = await supabase
        .from('choirs')
        .insert([{ name: choirName }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['choirs'] });
      setIsAddChoirModalOpen(false);
      toast.success('New choir created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create choir');
      console.error('Error creating choir:', error);
    }
  });

  // Mutation to remove song from choir
  const removeSongFromChoir = useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase
        .from('songs')
        .update({ choir_id: null })
        .eq('id', songId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', selectedChoirId] });
      queryClient.invalidateQueries({ queryKey: ['available-songs', selectedChoirId] });
      toast.success('Song removed from choir!');
    },
    onError: (error) => {
      toast.error('Failed to remove song from choir');
      console.error('Error removing song from choir:', error);
    }
  });

  const handleAddSelectedSongs = () => {
    addSongsToChoir.mutate(selectedSongs);
  };

  const handleAddChoir = (choirName: string) => {
    addChoir.mutate(choirName);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Choir Songs Management</h1>
          <ChoirSelector
            choirs={choirs}
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
                        onClick={() => removeSongFromChoir.mutate(song.id)}
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
