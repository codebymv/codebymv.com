import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    // Slightly older floor than Vite's default so a stray modern syntax
    // feature can't white-screen older iOS Safari.
    target: ['es2019', 'safari13'],
    // Hashed bundles live under /static so they can be cached immutable
    // without catching the unhashed media in /assets/images.
    assetsDir: 'static',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './public/assets'),
    },
  },
  publicDir: 'public',
});