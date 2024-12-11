import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import PlayerPage from "./pages/PlayerPage";
import AdminSongPage from "./pages/AdminSongPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/player/:slug" element={<PlayerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/songs/new"
            element={
              <ProtectedRoute>
                <AdminSongPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/songs/:id/edit"
            element={
              <ProtectedRoute>
                <AdminSongPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;