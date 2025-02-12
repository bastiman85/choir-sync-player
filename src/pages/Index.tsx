
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SongList from "@/components/SongList";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        if (!session) {
          toast.error("Du måste logga in för att se denna sida");
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center">
        <div className="text-lg">Laddar...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="container py-4 sm:py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Körsånger</h1>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                Logga ut
              </Button>
            </Link>
            <Link to="/admin">
              <Button>Admin</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <SongList />
        </div>
      </div>
    </div>
  );
};

export default Index;
