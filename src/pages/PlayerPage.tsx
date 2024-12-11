import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Player from "@/components/Player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PlayerPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: song, isLoading } = useQuery({
    queryKey: ['song', slug],
    queryFn: async () => {
      // First, find the song by its title (slug)
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `)
        .ilike('title', slug?.replace(/-/g, ' ') || '')
        .single();

      if (songError || !songData) {
        console.error('Error fetching song:', songError);
        return null;
      }

      return {
        id: songData.id,
        title: songData.title,
        choirId: songData.choir_id,
        tracks: songData.tracks.map((track: any) => ({
          id: track.id,
          url: track.url,
          voicePart: track.voice_part
        })),
        lyrics: songData.lyrics.map((lyric: any) => ({
          id: lyric.id,
          text: lyric.text,
          startTime: lyric.start_time,
          endTime: lyric.end_time
        })),
        chapters: songData.chapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          time: chapter.start_time,
          type: "verse" as const
        }))
      };
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
        <div className="text-lg">Song not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <Player song={song} />
      </div>
    </div>
  );
};

export default PlayerPage;