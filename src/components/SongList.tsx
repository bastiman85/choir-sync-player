import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Song } from "@/types/song";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useMemo } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SongList = () => {
  const [selectedTermin, setSelectedTermin] = useState<string>("all");

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
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      return data.map(song => ({
        id: song.id,
        title: song.title,
        pdf_url: song.pdf_url,
        htmlContent: song.html_content,
        termin: song.termin,
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

  const uniqueTerminer = useMemo(() => {
    if (!songs) return [];
    const terminer = songs
      .map(song => song.termin)
      .filter((termin): termin is string => !!termin);
    return Array.from(new Set(terminer)).sort();
  }, [songs]);

  const filteredSongs = useMemo(() => {
    if (!songs) return [];
    if (selectedTermin === "all") return songs;
    return songs.filter(song => song.termin === selectedTermin);
  }, [songs, selectedTermin]);

  if (isLoading) {
    return <div className="text-center py-8">Laddar sånger...</div>;
  }

  if (!songs?.length) {
    return <div className="text-center py-8">Inga sånger hittades</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filtrera på termin:</label>
        <Select
          value={selectedTermin}
          onValueChange={setSelectedTermin}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alla terminer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla terminer</SelectItem>
            {uniqueTerminer.map((termin) => (
              <SelectItem key={termin} value={termin}>
                {termin}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Termin</TableHead>
              <TableHead>Antal spår</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSongs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.title}</TableCell>
                <TableCell>{song.termin || "-"}</TableCell>
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
    </div>
  );
};

export default SongList;
