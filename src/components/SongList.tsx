
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Song } from "@/types/song";

const SongList = () => {
  const { data: songs, isLoading } = useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
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
        pdf_url: song.pdf_url,
        htmlContent: song.html_content,
        html_file_url: song.html_file_url,
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
      }));
    }
  });

  if (isLoading) {
    return <div>Laddar sånger...</div>;
  }

  if (!songs?.length) {
    return <div>Inga sånger hittades</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {songs.map((song) => (
        <Link
          key={song.id}
          to={`/player/${song.slug}`}
          className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium">{song.title}</h3>
        </Link>
      ))}
    </div>
  );
};

export default SongList;
