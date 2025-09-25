import { defineConfig, type PluginOption } from "vite";
import fs from "fs";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import mdx from "@mdx-js/rollup";

// https://vitejs.dev/config/
const hasFrontend = fs.existsSync(path.resolve(process.cwd(), "frontend"));

export default defineConfig({
  root: hasFrontend ? "frontend" : ".",
  publicDir: hasFrontend ? "public" : "public",
  plugins: [
    mdx({
      jsxImportSource: "react",
      providerImportSource: "@mdx-js/react",
    }) as PluginOption,
    react(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: hasFrontend
    ? {
        outDir: "../dist",
        emptyOutDir: true,
      }
    : undefined,
});
