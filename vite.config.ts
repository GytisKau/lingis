/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: "lingis",
  // build: {
    // target: ['chrome79', 'edge79', 'firefox70', 'safari14']
  // },
  plugins: [
    react(),
    // legacy(),
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
        // runtimeCaching: [
        //   {
        //     urlPattern: /.*\.wasm$/,
        //     handler: 'CacheFirst',
        //     options: {
        //       cacheName: 'wasm-cache',
        //       expiration: {
        //         maxEntries: 3,
        //         maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        //       }
        //     }
        //   }
        // ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
