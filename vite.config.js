import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,

      srcDir: "src",
      filename: "service-worker.js",
      strategies: "injectManifest",

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "seoChecker",
        short_name: "seoChecker",
        description: "seoChecker",
        theme_color: "#ffffff",
      },
      injectManifest: {
        injectionPoint: undefined,
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
  build: {
    minify: "terser", // Usa Terser invece di esbuild
    terserOptions: {
      compress: {
        drop_console: true, // Rimuove i console.log
        drop_debugger: true, // Rimuove i debugger
      },
      format: {
        comments: false, // Rimuove i commenti dal codice minificato
      },
    },
  },
});
