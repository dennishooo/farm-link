import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// GitHub Pages serves project sites from /<repo>/, so assets need that base.
// Override with BASE_PATH=/ when deploying to a custom domain or a user site.
const base = process.env.BASE_PATH ?? '/farm-link/'

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    // Build date only, so a rebuild of the same commit stays comparable.
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable.png'],
      manifest: {
        name: 'FarmLink — Agricola',
        short_name: 'FarmLink',
        description:
          'An offline-playable implementation of the Agricola base game for pass-and-play on one device.',
        theme_color: '#2f7d3c',
        background_color: '#f4f7ef',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The whole app is static and self-contained, so precaching every
        // build asset is what makes a cold start work with no network.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // The card database and its translations are ~200 KB of generated data
        // that changes only when the deck is regenerated, while the app around
        // it changes every release. Splitting them apart means a release
        // invalidates the app chunk alone: the service worker re-downloads the
        // code and keeps the cards it already has, which is most of the bytes.
        //
        // This does not defer the download — the cards are a static dependency
        // of the engine and the app precaches everything anyway, by design. It
        // is about what a returning player has to fetch on an update.
        manualChunks: (id) =>
          id.includes('/game/cards/data.ts') || id.includes('/game/cards/translations.ts')
            ? 'cards'
            : undefined,
      },
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
})
