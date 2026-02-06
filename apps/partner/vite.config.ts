
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    proxy: {
      '/api/v1': {
        target: 'https://vanessa-unabsolved-buck.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
      // Proxy for merchant images to bypass ngrok warning
      '/merchant-images': {
        target: 'https://vanessa-unabsolved-buck.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
      // Proxy for any image file extensions to bypass ngrok warning
      '^/.*\\.(jpg|jpeg|png|gif|webp|svg)$': {
        target: 'https://vanessa-unabsolved-buck.ngrok-free.dev',
        changeOrigin: true,
        secure: false,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})

