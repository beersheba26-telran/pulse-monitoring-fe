import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@chakra-ui') || id.includes('@emotion') || id.includes('react-icons')) {
            return 'ui-vendor'
          }

          if (id.includes('@tanstack')) {
            return 'data-vendor'
          }

          if (id.includes('zustand')) {
            return 'state-vendor'
          }

          if (id.includes('axios')) {
            return 'network-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    watch: {
      ignored: ['**/mock/**'],
    },
  },
})
