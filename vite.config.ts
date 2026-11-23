/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  // GitHub Pages depo alt yolunda yayınlanır: https://<kullanıcı>.github.io/garaj/
  base: process.env.GITHUB_PAGES ? '/garaj/' : '/',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Garaj',
        short_name: 'Garaj',
        description: 'Kerem’in ikinci el alım satım hikâyesi',
        lang: 'tr',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        background_color: '#0E1116',
        theme_color: '#0E1116',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webp}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts', './tests/ui/uiHelpers.tsx'],
  },
})
