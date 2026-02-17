// Build Cache Configuration - Centralized build caching settings
// Flexy hates hardcoded values! All build cache settings are now configurable.

/**
 * Vite build configuration
 */
export const viteBuildConfig = {
  // Cache directory for Vite builds
  cacheDir: process.env.VITE_CACHE_DIR || '.vite-cache',

  // Chunk size warning limit in KB (default: 1000KB = 1MB)
  chunkSizeWarningLimit: parseInt(
    process.env.VITE_CHUNK_SIZE_WARNING_KB || '1000',
    10
  ),

  // Force pre-bundle heavy dependencies
  forcePrebundle: process.env.VITE_FORCE_PREBUNDLE !== 'false',

  // ESBuild target
  esbuildTarget: process.env.VITE_ESBUILD_TARGET || 'esnext',
} as const

/**
 * Webpack build configuration (for compatibility)
 */
export const webpackBuildConfig = {
  // Enable filesystem caching
  cacheEnabled: process.env.WEBPACK_CACHE_ENABLED !== 'false',

  // Cache type
  cacheType: process.env.WEBPACK_CACHE_TYPE || 'filesystem',
} as const

/**
 * Nitro build configuration
 */
export const nitroBuildConfig = {
  // Enable experimental async context
  asyncContextEnabled: process.env.NITRO_ASYNC_CONTEXT !== 'false',
} as const

/**
 * Build optimization configuration
 */
export const buildOptimizationConfig = {
  // Enable build optimizations
  enabled: process.env.BUILD_OPTIMIZATIONS_ENABLED !== 'false',

  // Minification settings
  minify: process.env.BUILD_MINIFY !== 'false',

  // Source maps generation
  sourcemaps: process.env.BUILD_SOURCEMAPS === 'true',

  // Asset inlining threshold in bytes
  assetInlineLimit: parseInt(
    process.env.BUILD_ASSET_INLINE_LIMIT_BYTES || '4096',
    10
  ),
} as const

export type ViteBuildConfig = typeof viteBuildConfig
export type WebpackBuildConfig = typeof webpackBuildConfig
export type NitroBuildConfig = typeof nitroBuildConfig
export type BuildOptimizationConfig = typeof buildOptimizationConfig
