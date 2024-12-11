import React from "react";
import AdminSongForm from "@/components/AdminSongForm";
import { Song } from "@/types/song";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// Mock data - in a real app, this would come from an API
const mockSong: Song = {
  id: "1",
  title: "Amazing Grace",
  choirId: "1",
  tracks: [],
  lyrics: [],
  chapters: [],
};

const AdminSongPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // In a real app, you'd fetch the song data from an API
  const initialSong = isEditMode ? mockSong : undefined;

  const handleSubmit = (song: Partial<Song>) => {
    // In a real app, you'd save this to a backend
    console.log("Saving song:", song);
    toast.success(`Song ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? "Edit Song" : "Add New Song"}
        </h1>
        <AdminSongForm onSubmit={handleSubmit} initialSong={initialSong} />
      </div>
    </div>
  );
};

export default AdminSongPage;