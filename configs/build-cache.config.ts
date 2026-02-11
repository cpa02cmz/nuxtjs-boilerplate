// Build cache configuration for faster builds
export default defineNuxtConfig({
  nitro: {
    // Enable build caching
    experimental: {
      // Enable filesystem caching for builds
      asyncContext: true,
    },
  },

  vite: {
    build: {
      // Enable persistent caching
      cacheDir: '.vite-cache',
      // Optimize chunk size warnings
      chunkSizeWarningLimit: 1000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    optimizeDeps: {
      // Force pre-bundle these heavy dependencies
      force: true,
      // Cache optimized dependencies
      esbuildOptions: {
        target: 'esnext',
      },
    },
  },

  // Enable webpack build cache (if using webpack)
  webpack: {
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [import.meta.filename],
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
})
