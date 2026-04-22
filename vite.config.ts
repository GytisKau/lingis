/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // base: "lingis",
  build: {
    outDir: "build"
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['favicon.png'],
      manifest: {
        id: "Lingis",
        name: "Lingis",
        short_name: "Lingis",
        description: "Mokymosi programėlė",
        theme_color: '#ffffff',
        icons: [
          {
            src: "favicon.png",
            sizes: "64x64 32x32 24x24 16x16",
            type:  "image/x-icon"
          },
          {
            src: "icon.png",
            "type": "image/png",
            "sizes": "512x512",
            "purpose": "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // exclude .wasm
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
