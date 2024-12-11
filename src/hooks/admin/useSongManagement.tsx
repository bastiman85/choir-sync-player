import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song, Choir } from "@/types/song";
import { toast } from "sonner";

export const useSongManagement = (selectedChoirId: string) => {
  const queryClient = useQueryClient();

  // Fetch songs based on selected choir
  const { data: choirSongs = [] } = useQuery({
    queryKey: ['songs', selectedChoirId],
    queryFn: async () => {
      let query = supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `);
      
      if (selectedChoirId) {
        query = query.eq('choir_id', selectedChoirId);
      }

      const { data, error } = await query;
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
    }
  });

  // Fetch available songs
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
    }
  });

  // Add songs to choir mutation
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
      toast.success(`Songs added to choir successfully!`);
    },
    onError: (error) => {
      toast.error('Failed to add songs to choir');
      console.error('Error adding songs to choir:', error);
    }
  });

  // Remove song from choir mutation
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

  return {
    choirSongs,
    availableSongs,
    addSongsToChoir,
    removeSongFromChoir
  };
};