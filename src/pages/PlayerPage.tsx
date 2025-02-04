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
    // Load player-specific script from public directory
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
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select(`
          id,
          title,
          choir_id,
          pdf_url,
          tracks (
            id,
            url,
            voice_part
          ),
          lyrics (
            id,
            text,
            start_time,
            end_time
          ),
          chapters (
            id,
            title,
            start_time
          ),
          html_content,
          html_file_url
        `)
        .eq('slug', slug)
        .single();

      if (songError || !songData) {
        console.error('Error fetching song:', songError);
        return null;
      }

      return {
        id: songData.id,
        title: songData.title,
        choirId: songData.choir_id,
        pdf_url: songData.pdf_url,
        tracks: songData.tracks.map((track) => {
          const voicePart = track.voice_part.toLowerCase();
          if (!isValidVoicePart(voicePart)) {
            console.error(`Invalid voice part: ${voicePart}`);
            return {
              id: track.id,
              url: track.url,
              voicePart: "all" as VoicePart // fallback to "all" if invalid
            };
          }
          return {
            id: track.id,
            url: track.url,
            voicePart
          };
        }),
        lyrics: songData.lyrics.map((lyric) => ({
          id: lyric.id,
          text: lyric.text,
          startTime: lyric.start_time,
          endTime: lyric.end_time
        })),
        chapters: songData.chapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          time: chapter.start_time,
          type: "verse" as const
        })),
        htmlContent: songData.html_content,
        html_file_url: songData.html_file_url
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