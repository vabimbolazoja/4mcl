import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),  // client folder where index.html lives
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),  // @ for imports inside client/src
      "@shared": path.resolve(__dirname, "shared"),  // if you have shared folder at root
      "@assets": path.resolve(__dirname, "attached_assets"),  // your assets folder at root
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),  // build output at root/dist
    emptyOutDir: true,  // clean dist folder before build
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
