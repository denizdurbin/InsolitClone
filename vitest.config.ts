import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: process.env.ALLURE
      ? ['__tests__/setup.ts', 'allure-vitest/setup']
      : ['__tests__/setup.ts'],
    exclude: ['**/__tests__/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['app/api/**/*.ts'],
    },
    reporters: process.env.ALLURE
      ? ['default', ['allure-vitest/reporter', { resultsDir: 'allure-results/unit' }]]
      : ['default'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'server-only': path.resolve(__dirname, '__tests__/mocks/server-only.ts'),
    },
  },
})
