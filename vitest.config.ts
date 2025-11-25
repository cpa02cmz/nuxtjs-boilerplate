import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt', // Use nuxt environment for Nuxt-specific features
    setupFiles: ['./test-setup.ts'],
    environmentOptions: {
      nuxt: {
        rootDir: '.',
        overrides: {
          // Add any necessary nuxt config overrides for testing
        },
      },
    },
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
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
})
