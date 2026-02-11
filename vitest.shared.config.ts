import path from 'path'

/**
 * Shared Vitest resolve aliases
 * Used across all Vitest configurations to ensure consistency
 */
export const vitestAliases = {
  '~': path.resolve(__dirname, '.'),
  '@': path.resolve(__dirname, '.'),
  '#app': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
  '#imports': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
  '#build': path.resolve(__dirname, 'test-mocks/nuxt-imports.ts'),
}
