
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
      
      return {
        id: data.id,
        title: data.title,
        pdf_url: data.pdf_url,
        htmlContent: data.html_content,
        termin: data.termin,
        slug: data.slug,
        tracks: data.tracks.map((track: any) => ({
          id: track.id,
          url: track.url,
          voicePart: track.voice_part
        })),
        lyrics: data.lyrics.map((lyric: any) => ({
          id: lyric.id,
          text: lyric.text,
          startTime: lyric.start_time,
          endTime: lyric.end_time
        })),
        chapters: data.chapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          time: chapter.start_time,
          type: "verse" as const
        }))
      } as Song;
    },
    enabled: isEditMode
  });

  const createSong = useMutation({
    mutationFn: async (newSong: Partial<Song>) => {
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert([{
          title: newSong.title,
          html_content: newSong.htmlContent,
          pdf_url: newSong.pdf_url,
          termin: newSong.termin,
          slug: newSong.slug
        }])
        .select()
        .single();
      if (songError) throw songError;

      if (newSong.tracks?.length) {
        const { error: tracksError } = await supabase
          .from('tracks')
          .insert(
            newSong.tracks.map(track => ({
              song_id: songData.id,
              voice_part: track.voicePart,
              url: track.url
            }))
          );
        if (tracksError) throw tracksError;
      }

      if (newSong.lyrics?.length) {
        const { error: lyricsError } = await supabase
          .from('lyrics')
          .insert(
            newSong.lyrics.map(lyric => ({
              song_id: songData.id,
              text: lyric.text,
              start_time: lyric.startTime,
              end_time: lyric.endTime || lyric.startTime
            }))
          );
        if (lyricsError) throw lyricsError;
      }

      if (newSong.chapters?.length) {
        const { error: chaptersError } = await supabase
          .from('chapters')
          .insert(
            newSong.chapters.map(chapter => ({
              song_id: songData.id,
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

      const { error: songError } = await supabase
        .from('songs')
        .update({
          title: updatedSong.title,
          html_content: updatedSong.htmlContent,
          pdf_url: updatedSong.pdf_url,
          termin: updatedSong.termin,
          slug: updatedSong.slug
        })
        .eq('id', id);
      if (songError) throw songError;

      const deletePromises = [
        supabase.from('tracks').delete().eq('song_id', id),
        supabase.from('lyrics').delete().eq('song_id', id),
        supabase.from('chapters').delete().eq('song_id', id)
      ];
      await Promise.all(deletePromises);

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
