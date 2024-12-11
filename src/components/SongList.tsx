import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface SongListProps {
  selectedChoirId: string | null;
}

const SongList = ({ selectedChoirId }: SongListProps) => {
  const { data: songs, isLoading } = useQuery({
    queryKey: ["songs", selectedChoirId],
    queryFn: async () => {
      let query = supabase.from("songs").select("*");
      
      if (selectedChoirId) {
        query = query.eq("choir_id", selectedChoirId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
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
          to={`/player/${song.title.toLowerCase().replace(/ /g, "-")}`}
          className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium">{song.title}</h3>
        </Link>
      ))}
    </div>
  );
};

export default SongList;