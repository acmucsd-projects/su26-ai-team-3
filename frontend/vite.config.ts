import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allows the dev server to be reached through a tunnel host (e.g. trycloudflare.com)
    // whose hostname changes each run, instead of Vite's default host allowlist.
    allowedHosts: true,
  },
})
