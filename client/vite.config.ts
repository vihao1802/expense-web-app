import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          react: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@emotion/react", "@emotion/styled"],
          muiIcons: ["@mui/icons-material"],
          // Group large dependencies
          recharts: ["recharts"],
          // Keep other dependencies in vendor
          vendor: ["axios"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "@mui/icons-material",
      "@mui/material",
      "@mui/x-date-pickers",
      "@mui/styled-engine",
    ],
  },
});
