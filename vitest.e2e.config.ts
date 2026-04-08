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

const isCI = Boolean(process.env.CI)
const withAllure = Boolean(process.env.ALLURE)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reporters: any[] = ['default']
if (isCI || withAllure) reporters.push(['allure-vitest/reporter', { resultsDir: 'allure-results/e2e' }])
if (isCI) reporters.push(['junit', { outputFile: 'test-results/e2e.xml' }])

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['__tests__/e2e/**/*.test.ts'],
    setupFiles: [
      '__tests__/e2e/setup.ts',
      ...(isCI || withAllure ? ['allure-vitest/setup'] : []),
    ],
    testTimeout: 15000,
    hookTimeout: 15000,
    // Run serially to avoid race conditions on shared DB state
    sequence: { concurrent: false },
    reporters,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, '__tests__/mocks/server-only.ts'),
    },
  },
})
