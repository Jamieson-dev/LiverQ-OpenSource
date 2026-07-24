import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep React in its own long-lived chunk so app/code edits don't
        // force users to re-download it. (The question bank is code-split
        // automatically via the dynamic import in dataSource.ts.)
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
