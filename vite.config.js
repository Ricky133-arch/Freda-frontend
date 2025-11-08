import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],

  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    // Proxy only for local dev — uses VITE_API_URL in prod
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Only used in dev
        changeOrigin: true,
        secure: false,
      },
    },
  },

  esbuild: {
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx', '.jsx': 'jsx' },
    },
  },

  experimental: {
    oxc: false,
  },
});