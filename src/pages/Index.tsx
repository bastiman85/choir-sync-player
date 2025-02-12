
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SongList from "@/components/SongList";

const Index = () => {
  const { data: choirs, isLoading: choirsLoading } = useQuery({
    queryKey: ["choirs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("choirs").select("*");
      if (error) throw error;
      return data;
    },
  });

  if (choirsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
        <div className="text-lg">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-4 sm:py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Körsånger</h1>
          <Link to="/admin">
            <Button>Admin</Button>
          </Link>
        </div>

        <div className="space-y-6">
          <SongList />
        </div>
      </div>
    </div>
  );
};

export default Index;
