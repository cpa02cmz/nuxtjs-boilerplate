import { defineConfig, type UserConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { vitestAliases } from './vitest.shared.config'

// Determine test profile from environment variable
const testProfile = process.env.VITEST_PROFILE || 'default'

// Base configuration
const baseConfig: UserConfig = {
  plugins: [vue()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
      '#app': path.resolve(__dirname, 'test-mocks/nuxt-app.ts'),
      '#imports': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
      '#build': path.resolve(__dirname, 'test-mocks/nuxt-app.ts'),
    },
  },
}

// Default profile configuration
const defaultConfig: UserConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 10000,
    setupFiles: ['./test-setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/__tests__/server/**',
      '**/__tests__/*integration*.test.ts',
      '**/performance/*.test.ts',
      '**/tests/brocula/**',
    ],
    coverage: {
      provider: 'v8' as const,
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

// Integration profile configuration
const integrationConfig: UserConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: 'vitest-environment-nuxt',
    testTimeout: 10000,
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.integration.test.ts', '**/__tests__/*integration*.test.ts'],
>>>>>>> origin/main
  },
}

// Performance profile configuration
const performanceConfig: UserConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 60000,
    setupFiles: ['./test-setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    include: ['**/performance/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.nuxt/**'],
  },
}

// Select configuration based on profile
const profiles: Record<string, UserConfig> = {
  default: defaultConfig,
  integration: integrationConfig,
  performance: performanceConfig,
}

export default defineConfig(profiles[testProfile] || defaultConfig)
