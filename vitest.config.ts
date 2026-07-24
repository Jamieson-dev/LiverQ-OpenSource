import { defineConfig } from 'vitest/config'

// Standalone Vitest config. Kept separate from vite.config.ts so the app
// build is unaffected. Tests live under tests/ (outside `src`), so `tsc -b`
// and `vite build` never see them.
export default defineConfig({
  test: {
    // jsdom provides window.localStorage for the storage round-trip tests.
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
})
