import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SongList from "@/components/SongList";
import { useEffect, useState } from "react";

const Index = () => {
  const [selectedChoirId, setSelectedChoirId] = useState<string | null>(null);

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
          <div>
            <label className="block text-sm font-medium mb-2">Välj kör</label>
            <select
              className="w-full max-w-xs border border-gray-300 rounded-md p-2"
              value={selectedChoirId || ""}
              onChange={(e) =>
                setSelectedChoirId(e.target.value || null)
              }
            >
              <option value="">Alla körer</option>
              {choirs?.map((choir) => (
                <option key={choir.id} value={choir.id}>
                  {choir.name}
                </option>
              ))}
            </select>
          </div>

          <SongList selectedChoirId={selectedChoirId} />
        </div>
      </div>
    </div>
  );
};

export default Index;