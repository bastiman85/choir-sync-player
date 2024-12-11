import React from "react";
import AdminSongForm from "@/components/AdminSongForm";
import { Song } from "@/types/song";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminSongPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const { data: song, isLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Song;
    },
    enabled: isEditMode
  });

  const createSong = useMutation({
    mutationFn: async (newSong: Partial<Song>) => {
      // First, create the song
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert([{
          title: newSong.title,
          choir_id: newSong.choirId
        }])
        .select()
        .single();
      if (songError) throw songError;

      // Then create related records
      const songId = songData.id;

      // Create tracks
      if (newSong.tracks?.length) {
        const { error: tracksError } = await supabase
          .from('tracks')
          .insert(
            newSong.tracks.map(track => ({
              song_id: songId,
              voice_part: track.voicePart,
              url: track.url
            }))
          );
        if (tracksError) throw tracksError;
      }

      // Create lyrics
      if (newSong.lyrics?.length) {
        const { error: lyricsError } = await supabase
          .from('lyrics')
          .insert(
            newSong.lyrics.map(lyric => ({
              song_id: songId,
              text: lyric.text,
              start_time: lyric.startTime,
              end_time: lyric.endTime || lyric.startTime
            }))
          );
        if (lyricsError) throw lyricsError;
      }

      // Create chapters
      if (newSong.chapters?.length) {
        const { error: chaptersError } = await supabase
          .from('chapters')
          .insert(
            newSong.chapters.map(chapter => ({
              song_id: songId,
              title: chapter.title,
              start_time: chapter.time
            }))
          );
        if (chaptersError) throw chaptersError;
      }

      return songData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Song created successfully!');
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Error creating song:', error);
      toast.error('Failed to create song');
    }
  });

  const updateSong = useMutation({
    mutationFn: async (updatedSong: Partial<Song>) => {
      if (!id) throw new Error('No song ID provided');

      // Update song details
      const { error: songError } = await supabase
        .from('songs')
        .update({
          title: updatedSong.title,
          choir_id: updatedSong.choirId
        })
        .eq('id', id);
      if (songError) throw songError;

      // Delete existing related records
      const deletePromises = [
        supabase.from('tracks').delete().eq('song_id', id),
        supabase.from('lyrics').delete().eq('song_id', id),
        supabase.from('chapters').delete().eq('song_id', id)
      ];
      await Promise.all(deletePromises);

      // Create new related records
      if (updatedSong.tracks?.length) {
        const { error: tracksError } = await supabase
          .from('tracks')
          .insert(
            updatedSong.tracks.map(track => ({
              song_id: id,
              voice_part: track.voicePart,
              url: track.url
            }))
          );
        if (tracksError) throw tracksError;
      }

      if (updatedSong.lyrics?.length) {
        const { error: lyricsError } = await supabase
          .from('lyrics')
          .insert(
            updatedSong.lyrics.map(lyric => ({
              song_id: id,
              text: lyric.text,
              start_time: lyric.startTime,
              end_time: lyric.endTime || lyric.startTime
            }))
          );
        if (lyricsError) throw lyricsError;
      }

      if (updatedSong.chapters?.length) {
        const { error: chaptersError } = await supabase
          .from('chapters')
          .insert(
            updatedSong.chapters.map(chapter => ({
              song_id: id,
              title: chapter.title,
              start_time: chapter.time
            }))
          );
        if (chaptersError) throw chaptersError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['song', id] });
      toast.success('Song updated successfully!');
      navigate('/admin');
    },
    onError: (error) => {
      console.error('Error updating song:', error);
      toast.error('Failed to update song');
    }
  });

  const handleSubmit = (songData: Partial<Song>) => {
    if (isEditMode) {
      updateSong.mutate(songData);
    } else {
      createSong.mutate(songData);
    }
  };

  if (isEditMode && isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? "Edit Song" : "Add New Song"}
        </h1>
        <AdminSongForm onSubmit={handleSubmit} initialSong={song} />
      </div>
    </div>
  );
};

export default AdminSongPage;