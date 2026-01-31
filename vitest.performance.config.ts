import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

/**
 * Performance Test Configuration
 *
 * This configuration runs performance and optimization tests separately
 * from the main test suite to keep CI/CD pipeline fast.
 *
 * Usage: npx vitest --config vitest.performance.config.ts
 *
 * These tests are typically run:
 * - In nightly builds
 * - Before major releases
 * - When performance-critical code changes
 * - Manually when optimizing algorithms
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 60000, // Longer timeout for performance tests
    setupFiles: ['./test-setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    include: ['**/performance/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**'],
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
