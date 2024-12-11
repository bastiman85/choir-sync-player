import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Choir } from "@/types/song";
import ChoirSelector from "@/components/admin/ChoirSelector";
import AddChoirModal from "@/components/admin/AddChoirModal";
import SongTable from "@/components/admin/SongTable";
import AddSongsDialog from "@/components/admin/AddSongsDialog";
import { useSongManagement } from "@/hooks/admin/useSongManagement";

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const [isAddSongsDialogOpen, setIsAddSongsDialogOpen] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [isAddChoirModalOpen, setIsAddChoirModalOpen] = useState(false);
  const [selectedChoirId, setSelectedChoirId] = useState<string>("");

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

  const {
    choirSongs,
    availableSongs,
    addSongsToChoir,
    removeSongFromChoir
  } = useSongManagement(selectedChoirId);

  const handleAddSelectedSongs = () => {
    addSongsToChoir.mutate(selectedSongs, {
      onSuccess: () => {
        setIsAddSongsDialogOpen(false);
        setSelectedSongs([]);
      }
    });
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
          {!selectedChoirId && (
            <p className="text-sm text-muted-foreground">
              Showing all songs. Select a choir to filter.
            </p>
          )}
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

      <AddSongsDialog
        isOpen={isAddSongsDialogOpen}
        onOpenChange={setIsAddSongsDialogOpen}
        availableSongs={availableSongs}
        selectedSongs={selectedSongs}
        onSelectedSongsChange={setSelectedSongs}
        onAddSongs={handleAddSelectedSongs}
      />

      <AddChoirModal
        isOpen={isAddChoirModalOpen}
        onClose={() => setIsAddChoirModalOpen(false)}
        onSubmit={(choirName: string) => {
          const addChoir = async () => {
            const { error } = await supabase
              .from('choirs')
              .insert([{ name: choirName }]);
            if (error) throw error;
          };
          addChoir().then(() => {
            setIsAddChoirModalOpen(false);
            toast.success('New choir created successfully!');
          }).catch((error) => {
            toast.error('Failed to create choir');
            console.error('Error creating choir:', error);
          });
        }}
      />

      <SongTable
        songs={choirSongs}
        choirs={choirs}
        onRemoveFromChoir={(songId) => removeSongFromChoir.mutate(songId)}
      />
    </div>
  );
};

export default AdminOverviewPage;
