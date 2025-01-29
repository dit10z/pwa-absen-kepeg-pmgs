import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite({}), react()],
  server: {
    proxy: {
      "/tirta-wibawa-mukti/kepegawaian-api": {
        target: "https://devcharisma.aurorasystem.co.id",
        changeOrigin: true,
      },
    },
  },
});
