
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Song } from "@/types/song";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    return <div className="text-center py-8">Laddar sånger...</div>;
  }

  if (!songs?.length) {
    return <div className="text-center py-8">Inga sånger hittades</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Antal spår</TableHead>
            <TableHead>PDF</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => (
            <TableRow key={song.id}>
              <TableCell>{song.title}</TableCell>
              <TableCell>{song.tracks.length}</TableCell>
              <TableCell>
                {song.pdf_url ? (
                  <a 
                    href={song.pdf_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visa PDF
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Link
                  to={`/player/${song.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  Spela
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SongList;
