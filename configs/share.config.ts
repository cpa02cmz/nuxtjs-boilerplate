// Share Configuration - Social Media and Sharing Settings
// Flexy hates hardcoded URLs! All sharing settings are now configurable.

export const shareConfig = {
  // Social media share URLs
  urls: {
    twitter: 'https://twitter.com/intent/tweet',
    facebook: 'https://www.facebook.com/sharer/sharer.php',
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
    reddit: 'https://www.reddit.com/submit',
    telegram: 'https://t.me/share/url',
    whatsapp: 'https://wa.me/?text=',
    email: 'mailto:',
  },

  // Default share parameters
  defaults: {
    hashtags: 'FreeResources,WebDevelopment',
    via: 'FreeStuffDev',
    related: 'webdev,programming,opensource',
  },

  // Platform-specific settings
  platforms: {
    twitter: {
      maxTextLength: 280,
      maxHashtags: 3,
    },
    facebook: {
      maxTextLength: 2000,
    },
    linkedin: {
      maxTextLength: 1300,
    },
    reddit: {
      maxTitleLength: 300,
    },
  },

  // Share text templates
  templates: {
    resource: (title: string, url: string) =>
      `Check out ${title} - a great free resource for developers! ${url}`,
    comparison: (count: number) =>
      `Comparing ${count} free developer resources`,
    search: (query: string) => `Found some great free resources for "${query}"`,
    default: 'Found some great free resources for developers!',
  },

  // Share button configuration
  buttons: {
    showCopyLink: true,
    showNativeShare: true,
    preferredOrder: ['twitter', 'facebook', 'linkedin', 'reddit', 'copy'],
  },

  // Analytics
  analytics: {
    trackShares: true,
    trackCopyLink: true,
  },
} as const

export type ShareConfig = typeof shareConfig
