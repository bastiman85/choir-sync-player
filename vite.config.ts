import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./", // This ensures assets are loaded relative to the HTML file
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});