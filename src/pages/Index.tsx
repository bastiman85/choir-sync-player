import React, { useState } from "react";
import SongList from "@/components/SongList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Song, Choir } from "@/types/song";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [selectedChoirId, setSelectedChoirId] = useState<string>("");

  const { data: choirs = [] } = useQuery({
    queryKey: ['choirs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('choirs')
        .select('*');
      if (error) throw error;
      return data as Choir[];
    }
  });

  // Set initial selected choir when data is loaded
  React.useEffect(() => {
    if (choirs.length > 0 && !selectedChoirId) {
      setSelectedChoirId(choirs[0].id);
    }
  }, [choirs, selectedChoirId]);

  const { data: songs = [] } = useQuery({
    queryKey: ['songs', selectedChoirId],
    queryFn: async () => {
      if (!selectedChoirId) return [];
      const { data, error } = await supabase
        .from('songs')
        .select(`
          *,
          tracks (*)
        `)
        .eq('choir_id', selectedChoirId);
      if (error) throw error;
      return data.map(song => ({
        id: song.id,
        title: song.title,
        choirId: song.choir_id,
        tracks: song.tracks.map((track: any) => ({
          id: track.id,
          url: track.url,
          voicePart: track.voice_part
        })),
        lyrics: [], // These will be loaded in the player if needed
        chapters: [] // These will be loaded in the player if needed
      })) as Song[];
    },
    enabled: !!selectedChoirId
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Choir Practice App</h1>
            <div className="w-[250px]">
              <Select
                value={selectedChoirId}
                onValueChange={(value) => setSelectedChoirId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a choir" />
                </SelectTrigger>
                <SelectContent>
                  {choirs.map((choir) => (
                    <SelectItem key={choir.id} value={choir.id}>
                      {choir.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => navigate("/admin/songs/new")}>Add New Song</Button>
        </div>
        <SongList songs={songs} />
      </div>
    </div>
  );
};

export default Index;