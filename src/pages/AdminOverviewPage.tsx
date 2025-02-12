
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSongManagement } from "@/hooks/admin/useSongManagement";
import SongTable from "@/components/admin/SongTable";

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const { songs, removeSong } = useSongManagement();

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Songs Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage all songs in the system
          </p>
        </div>
        <div>
          <Button onClick={() => navigate("/admin/songs/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Song
          </Button>
        </div>
      </div>

      <SongTable
        songs={songs}
        onDelete={(songId) => removeSong.mutate(songId)}
      />
    </div>
  );
};

export default AdminOverviewPage;
