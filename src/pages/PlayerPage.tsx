
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Player from "@/components/Player";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoicePart } from "@/types/song";

const isValidVoicePart = (part: string): part is VoicePart => {
  return ["soprano", "alto", "tenor", "bass", "instrumental", "all"].includes(part);
};

const PlayerPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/js/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: song, isLoading } = useQuery({
    queryKey: ['song', slug],
    queryFn: async () => {
      console.log('Fetching song with slug:', slug);
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*),
          lyrics (*),
          chapters (*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching song:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        title: data.title,
        pdf_url: data.pdf_url,
        slug: data.slug,
        tracks: data.tracks.map((track) => {
          const voicePart = track.voice_part.toLowerCase();
          if (!isValidVoicePart(voicePart)) {
            console.error(`Invalid voice part: ${voicePart}`);
            return {
              id: track.id,
              url: track.url,
              voicePart: "all" as VoicePart
            };
          }
          return {
            id: track.id,
            url: track.url,
            voicePart
          };
        }),
        lyrics: data.lyrics.map((lyric) => ({
          id: lyric.id,
          text: lyric.text,
          startTime: lyric.start_time,
          endTime: lyric.end_time
        })),
        chapters: data.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          time: chapter.start_time,
          type: "verse" as const
        })),
        htmlContent: data.html_content
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
      <div className="container py-4 sm:py-6">
        <Player song={song} />
      </div>
    </div>
  );
};

export default PlayerPage;
