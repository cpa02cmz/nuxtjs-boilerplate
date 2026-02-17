import { defineConfig, type UserConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { thresholdsConfig } from './configs/thresholds.config'

// Determine test profile from environment variable
const testProfile = process.env.VITEST_PROFILE || 'default'

// Base configuration
const baseConfig: UserConfig = {
  plugins: [vue()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
      '#app': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
      '#imports': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
      '#build': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
    },
  },
  esbuild: {
    // BugFixer: Fix esbuild tsconfig resolution error during tests
    // Disable tsconfig resolution to prevent "Cannot find module './.nuxt/tsconfig.json'" errors
    tsconfigRaw: '{}',
  },
}

import { testTimingConfig } from './configs/test-timing.config'

// Default profile configuration
const defaultConfig: UserConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: testTimingConfig.timeout.default,
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
      include: [
        'components/**/*.vue',
        'composables/**/*.ts',
        'utils/**/*.ts',
        'pages/**/*.vue',
        'app.vue',
        'error.vue',
      ],
      exclude: [
        'node_modules/',
        'nuxt.config.ts',
        '.nuxt/',
        '.output/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'test-setup.ts',
        '__tests__/**',
        '**/tests/**',
        'test-mocks/**',
        'scripts/**',
        'server/**',
        'prisma/**',
        'data/**',
        'types/**',
        'docs/**',
        'public/**',
        'assets/**',
        'layouts/**',
        'modules/**',
        'middleware/**',
        'plugins/**',
        'configs/**',
        '**/factories/**',
      ],
      // Flexy says: No more hardcoded coverage thresholds! Using thresholdsConfig
      thresholds: {
        global: {
          branches: thresholdsConfig.coverage.branches,
          functions: thresholdsConfig.coverage.functions,
          lines: thresholdsConfig.coverage.lines,
          statements: thresholdsConfig.coverage.statements,
        },
      },
      all: true,
      clean: true,
    },
  },
}

// Integration profile configuration
const integrationConfig: UserConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: 'vitest-environment-nuxt',
    testTimeout: testTimingConfig.timeout.default,
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.integration.test.ts', '**/__tests__/*integration*.test.ts'],
  },
}

// Performance profile configuration
const performanceConfig: UserConfig = {
  ...baseConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: testTimingConfig.timeout.performance,
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
