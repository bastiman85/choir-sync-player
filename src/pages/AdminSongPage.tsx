import React from "react";
import AdminSongForm from "@/components/AdminSongForm";
import { Song } from "@/types/song";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminSongPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (song: Partial<Song>) => {
    // In a real app, you'd save this to a backend
    console.log("Saving song:", song);
    toast.success("Song saved successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Song</h1>
        <AdminSongForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default AdminSongPage;