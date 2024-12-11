import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayerPage from "./pages/PlayerPage";
import AdminSongPage from "./pages/AdminSongPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/player/:id" element={<PlayerPage />} />
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
  );
}

export default App;