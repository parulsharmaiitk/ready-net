import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Set BASE_PATH (e.g. "/ready-net/") when hosting under a sub-path such as GitHub Pages.
const base = process.env.BASE_PATH ?? '/';

import pkg from './package.json';

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // We register the service worker ourselves (src/pwa/registerSW.ts) so we can show an update toast.
      injectRegister: null,
      manifest: {
        name: 'ReadyNet',
        short_name: 'ReadyNet',
        description:
          'Check in after a disaster, get first-aid steps and find supply caches. Works offline.',
        display: 'standalone',
        start_url: base,
        scope: base,
        theme_color: '#12212E',
        background_color: '#F4F6F8',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,json,webmanifest}'],
        // Adds the notificationclick handler used by the demo alerts.
        importScripts: ['sw-notifications.js'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
