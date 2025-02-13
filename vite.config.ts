
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        if (mode === 'development') {
          return html.replace(
            '</head>',
            `<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script></head>`
          );
        }
        return html;
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/", // Ensure base URL is set to root
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    sourcemap: true,
    target: 'es2015',
    minify: 'terser',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
}));
