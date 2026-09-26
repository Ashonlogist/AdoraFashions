import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The dashboard calls `/api/*`, which Vite does not serve. `npm run dev` starts
// scripts/dev-api.mts alongside this, and this proxy forwards the admin API to
// it so the login form works on localhost exactly as it does in production.
const api = process.env.API_ORIGIN ?? 'http://localhost:8787'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: api, changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: api, changeOrigin: true },
    },
  },
  build: {
    assetsInlineLimit: 2048,
  },
})
