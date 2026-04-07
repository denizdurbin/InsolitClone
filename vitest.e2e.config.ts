import { defineConfig } from 'vitest/config'
import path from 'path'
import { readFileSync } from 'fs'

// Load .env.test.local into process.env before Vitest imports any module
function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // file absent — tests will fail with a clear Supabase connection error
  }
}

loadEnvFile(path.resolve(__dirname, '.env.test.local'))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/e2e/**/*.test.ts'],
    setupFiles: process.env.ALLURE
      ? ['__tests__/e2e/setup.ts', 'allure-vitest/setup']
      : ['__tests__/e2e/setup.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Run serially to avoid race conditions on shared DB state
    sequence: { concurrent: false },
    reporters: process.env.ALLURE
      ? ['default', ['allure-vitest/reporter', { resultsDir: 'allure-results/e2e' }]]
      : ['default'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, '__tests__/mocks/server-only.ts'),
    },
  },
})
