// Image Configuration - Image Quality and Optimization Settings
// Flexy hates hardcoded values! All image settings are now configurable.

export const imageConfig = {
  // Quality settings for different image contexts
  // Flexy hates hardcoded quality values!
  quality: {
    // High quality for main/featured images (e.g., lightbox, hero images)
    // Env: IMAGE_QUALITY_HIGH
    high: parseInt(process.env.IMAGE_QUALITY_HIGH || '90'),

    // Medium quality for standard images (e.g., recommendation cards, grid views)
    // Env: IMAGE_QUALITY_MEDIUM
    medium: parseInt(process.env.IMAGE_QUALITY_MEDIUM || '80'),

    // Low quality for thumbnails and small previews
    // Env: IMAGE_QUALITY_LOW
    low: parseInt(process.env.IMAGE_QUALITY_LOW || '60'),

    // Maximum quality cap to prevent excessive file sizes
    // Env: IMAGE_QUALITY_MAX
    max: parseInt(process.env.IMAGE_QUALITY_MAX || '95'),

    // Minimum quality floor to ensure acceptable visual quality
    // Env: IMAGE_QUALITY_MIN
    min: parseInt(process.env.IMAGE_QUALITY_MIN || '50'),
  },

  // Image dimensions
  dimensions: {
    // Default thumbnail width
    // Env: IMAGE_THUMB_WIDTH
    thumbnailWidth: parseInt(process.env.IMAGE_THUMB_WIDTH || '80'),

    // Default thumbnail height
    // Env: IMAGE_THUMB_HEIGHT
    thumbnailHeight: parseInt(process.env.IMAGE_THUMB_HEIGHT || '60'),

    // Default icon size for recommendation cards
    // Env: IMAGE_ICON_SIZE
    iconSize: parseInt(process.env.IMAGE_ICON_SIZE || '32'),

    // Default screenshot preview width
    // Env: IMAGE_SCREENSHOT_WIDTH
    screenshotWidth: parseInt(process.env.IMAGE_SCREENSHOT_WIDTH || '400'),

    // Default screenshot preview height
    // Env: IMAGE_SCREENSHOT_HEIGHT
    screenshotHeight: parseInt(process.env.IMAGE_SCREENSHOT_HEIGHT || '300'),
  },

  // Format settings
  format: {
    // Default format (avif, webp, jpg, png)
    // Env: IMAGE_DEFAULT_FORMAT
    default:
      (process.env.IMAGE_DEFAULT_FORMAT as 'avif' | 'webp' | 'jpg' | 'png') ||
      'avif',

    // Fallback format for browsers without AVIF support
    // Env: IMAGE_FALLBACK_FORMAT
    fallback:
      (process.env.IMAGE_FALLBACK_FORMAT as 'webp' | 'jpg' | 'png') || 'webp',
  },

  // Lazy loading settings
  lazyLoading: {
    // Enable lazy loading by default
    // Env: IMAGE_LAZY_LOADING_ENABLED
    enabled: process.env.IMAGE_LAZY_LOADING_ENABLED !== 'false',

    // Loading placeholder type (blur, color, none)
    // Env: IMAGE_PLACEHOLDER_TYPE
    placeholder:
      (process.env.IMAGE_PLACEHOLDER_TYPE as 'blur' | 'color' | 'none') ||
      'blur',
  },

  // Optimization settings
  optimization: {
    // Enable image optimization
    // Env: IMAGE_OPTIMIZATION_ENABLED
    enabled: process.env.IMAGE_OPTIMIZATION_ENABLED !== 'false',

    // Progressive loading for JPEGs
    // Env: IMAGE_PROGRESSIVE_JPEG
    progressiveJpeg: process.env.IMAGE_PROGRESSIVE_JPEG !== 'false',

    // Remove metadata from images
    // Env: IMAGE_STRIP_METADATA
    stripMetadata: process.env.IMAGE_STRIP_METADATA !== 'false',
  },
} as const

export type ImageConfig = typeof imageConfig
