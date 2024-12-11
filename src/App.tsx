import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayerPage from "./pages/PlayerPage";
import AdminSongPage from "./pages/AdminSongPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/admin/songs/new" element={<AdminSongPage />} />
        <Route path="/admin/songs/:id/edit" element={<AdminSongPage />} />
      </Routes>
    </Router>
  );
}

export default App;