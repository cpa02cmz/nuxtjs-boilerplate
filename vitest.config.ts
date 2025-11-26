import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules/',
      'dist',
      '.nuxt',
      '.output',
      'coverage',
      '**/*.d.ts',
      '**/*.config.*',
      'components/**/*.vue', // Exclude Vue components for now until we fix imports
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
        'components/**/*.vue',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '#imports': resolve(__dirname, './test-setup.ts'),
      '#app/composables/router': resolve(__dirname, './test-setup.ts'),
      '#app/composables/state': resolve(__dirname, './test-setup.ts'),
      '#app/composables/fetch': resolve(__dirname, './test-setup.ts'),
      '#app/composables/head': resolve(__dirname, './test-setup.ts'),
    },
  },
})
