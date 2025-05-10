import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001, // Use a different port to avoid conflicts with the main app
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  // Use a different entry point for the responsive dashboard
  optimizeDeps: {
    entries: ['src/main-responsive.jsx'],
  },
})
