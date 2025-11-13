import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: mode === "development"
      ? [
          // More specific routes first
          {
            "/api/proxy": {
              target: "http://localhost:3001",
              changeOrigin: true,
              secure: false,
            },
          },
          // Less specific routes after
          {
            "/api": {
              target: "https://pyq-ai.onrender.com",
              changeOrigin: true,
              secure: false,
            },
          },
        ].reduce((acc, curr) => ({ ...acc, ...curr }), {})
      : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
