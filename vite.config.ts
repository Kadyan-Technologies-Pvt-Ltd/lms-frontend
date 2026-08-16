import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Backend target is 8010, not the project's normal 8000 — Docker
      // Desktop/WSL2's networking relay (wslrelay.exe) claimed a whole
      // range of low ports (8000, 8001, ...) on this machine partway
      // through a long dev session, unrelated to this app. 8010 was
      // confirmed free. Once the usual port is free again (stop whatever's
      // using it in WSL/Docker, or reboot), change this back to 8000 and
      // run `python manage.py runserver 8000` as usual — 8010 isn't a new
      // permanent convention.
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
      },
      // Backend ImageField/FileField URLs (e.g. the library logo) come back
      // as host-relative paths like "/media/library/logo/...", not
      // absolute URLs — production's Nginx serves /media on the same
      // origin as the frontend (see nginx/nginx.conf), so this proxy rule
      // is dev's equivalent of that. Without it, an <img src="/media/...">
      // resolves against the Vite origin, which doesn't have the file and
      // falls back to serving index.html (200, wrong content) instead of
      // a real 404 — the image just silently fails to render.
      '/media': {
        target: 'http://localhost:8010',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keeps large, rarely-changing vendor code in its own cacheable
        // chunk instead of duplicated across every route chunk that
        // imports from it (route splitting alone doesn't dedupe shared
        // deps between chunks). Function form, not the classic Rollup
        // object-record form — this Vite version resolves to Rolldown,
        // whose manualChunks type only accepts a function.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (/react-router|\/react\/|\/react-dom\//.test(id)) return 'react-vendor'
            if (id.includes('recharts')) return 'chart-vendor'
            if (id.includes('@tanstack/react-table')) return 'table-vendor'
          }
        },
      },
    },
  },
})
