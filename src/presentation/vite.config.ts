import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '3000'),
    host: true,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || '3001'}`,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
  }
})
