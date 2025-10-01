import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // Relative paths for assets, good for deployment
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0', // Allow access from local network (e.g., phone)
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Preserve /api prefix
        secure: false, // Allow non-HTTPS for local testing
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