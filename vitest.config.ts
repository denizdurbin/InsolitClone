import { defineConfig } from 'vitest/config'
import path from 'path'

const isCI = Boolean(process.env.CI)
const withAllure = Boolean(process.env.ALLURE)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reporters: any[] = ['default']
if (isCI || withAllure) reporters.push(['allure-vitest/reporter', { resultsDir: 'allure-results/unit' }])
if (isCI) reporters.push(['junit', { outputFile: 'test-results/unit.xml' }])

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [
      '__tests__/setup.ts',
      ...(isCI || withAllure ? ['allure-vitest/setup'] : []),
    ],
    exclude: ['**/__tests__/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['app/api/**/*.ts'],
    },
    reporters,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, '__tests__/mocks/server-only.ts'),
    },
  },
})
