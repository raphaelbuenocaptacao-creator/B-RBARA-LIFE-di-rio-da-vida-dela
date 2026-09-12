import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/B-RBARA-LIFE-di-rio-da-vida-dela/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
})
