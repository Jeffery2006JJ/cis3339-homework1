import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// The Vue source lives in ./frontend; the production build goes to ./dist,
// which the Express server (backend/server.js) serves.
export default defineConfig({
  root: fileURLToPath(new URL('./frontend', import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./frontend/src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // During development, forward API calls to the Express server.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
