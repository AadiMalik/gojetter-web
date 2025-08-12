import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // Allow access from network, Docker, WSL
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws', // change to 'wss' if using HTTPS
      host: 'localhost', // or your machine's LAN IP if testing from another device
      port: 5173
    }
  }
})
