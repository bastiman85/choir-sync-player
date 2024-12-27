import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        if (process.env.NODE_ENV === 'development') {
          return html.replace(
            '</body>',
            `<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script></body>`
          );
        }
        return html;
      }
    }
  ],
  base: "./", // This ensures assets are loaded relative to the HTML file
  server: {
    port: 8080,
    host: "::",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});