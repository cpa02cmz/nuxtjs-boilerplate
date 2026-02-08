import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Flexy hates hardcoded values! Use environment variables for test configuration.
const testTimeout = parseInt(process.env.VITEST_TEST_TIMEOUT || '10000')
const coverageBranches = parseInt(process.env.VITEST_COVERAGE_BRANCHES || '80')
const coverageFunctions = parseInt(
  process.env.VITEST_COVERAGE_FUNCTIONS || '80'
)
const coverageLines = parseInt(process.env.VITEST_COVERAGE_LINES || '80')
const coverageStatements = parseInt(
  process.env.VITEST_COVERAGE_STATEMENTS || '80'
)

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout,
    setupFiles: ['./test-setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/__tests__/server/**', // Server-side tests require database, run as integration tests
      '**/__tests__/*integration*.test.ts',
      '**/performance/*.test.ts', // Performance tests run separately to keep CI fast
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'nuxt.config.ts',
        '.nuxt/',
        '.output/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'test-setup.ts',
      ],
      thresholds: {
        global: {
          branches: coverageBranches,
          functions: coverageFunctions,
          lines: coverageLines,
          statements: coverageStatements,
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
      '#app': path.resolve(__dirname, 'test-mocks/nuxt-app.ts'),
      '#imports': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
      '#build': path.resolve(__dirname, 'test-mocks/nuxt-app.ts'),
    },
  },
})
