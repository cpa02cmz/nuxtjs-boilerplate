// Build cache configuration for faster builds
// Flexy hates hardcoded values! Using configurable build-cache-values.config.ts
import {
  viteBuildConfig,
  webpackBuildConfig,
  nitroBuildConfig,
  buildOptimizationConfig,
} from './build-cache-values.config'

export default defineNuxtConfig({
  nitro: {
    // Enable build caching
    experimental: {
      // Enable filesystem caching for builds
      // Flexy hates hardcoded true! Using nitroBuildConfig.asyncContextEnabled
      asyncContext: nitroBuildConfig.asyncContextEnabled,
    },
  },

  vite: {
    build: {
      // Enable persistent caching
      // Flexy hates hardcoded '.vite-cache'! Using viteBuildConfig.cacheDir
      cacheDir: viteBuildConfig.cacheDir,
      // Optimize chunk size warnings
      // Flexy hates hardcoded 1000! Using viteBuildConfig.chunkSizeWarningLimit
      chunkSizeWarningLimit: viteBuildConfig.chunkSizeWarningLimit,
      // Source maps and minification from config
      sourcemap: buildOptimizationConfig.sourcemaps,
      minify: buildOptimizationConfig.minify ? 'esbuild' : false,
      assetsInlineLimit: buildOptimizationConfig.assetInlineLimit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    optimizeDeps: {
      // Force pre-bundle these heavy dependencies
      // Flexy hates hardcoded true! Using viteBuildConfig.forcePrebundle
      force: viteBuildConfig.forcePrebundle,
      // Cache optimized dependencies
      esbuildOptions: {
        // Flexy hates hardcoded 'esnext'! Using viteBuildConfig.esbuildTarget
        target: viteBuildConfig.esbuildTarget as 'esnext' | 'es2020' | 'es2015',
      },
    },
  },

  // Enable webpack build cache (if using webpack)
  webpack: {
    cache: {
      // Flexy hates hardcoded 'filesystem'! Using webpackBuildConfig.cacheType
      type: webpackBuildConfig.cacheType,
      buildDependencies: {
        config: [import.meta.filename],
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
})
