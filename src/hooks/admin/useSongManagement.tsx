import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Song } from "@/types/song";
import { toast } from "sonner";

export const useSongManagement = () => {
  const queryClient = useQueryClient();

  const { data: songs = [] } = useQuery({
    queryKey: ['songs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `);
      if (error) throw error;

      return data.map(song => ({
        id: song.id,
        title: song.title,
        termin: song.termin,
        pdf_url: song.pdf_url,
        htmlContent: song.html_content,
        slug: song.slug,
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

  const removeSong = useMutation({
    mutationFn: async (songId: string) => {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast.success('Song removed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to remove song');
      console.error('Error removing song:', error);
    }
  });

  return {
    songs,
    removeSong
  };
};
