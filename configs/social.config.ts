// Social Media Configuration - Social sharing URLs and settings
// Flexy hates hardcoded URLs! All social media URLs are now configurable.

export const socialConfig = {
  // Social Media Base URLs
  urls: {
    twitter: {
      baseUrl:
        process.env.SOCIAL_TWITTER_BASE_URL ||
        'https://twitter.com/intent/tweet',
      params: {
        hashtags:
          process.env.SOCIAL_TWITTER_HASHTAGS || 'FreeResources,WebDevelopment',
      },
    },
    facebook: {
      baseUrl:
        process.env.SOCIAL_FACEBOOK_BASE_URL ||
        'https://www.facebook.com/sharer/sharer.php',
    },
    linkedin: {
      baseUrl:
        process.env.SOCIAL_LINKEDIN_BASE_URL ||
        'https://www.linkedin.com/sharing/share-offsite/',
    },
    reddit: {
      baseUrl:
        process.env.SOCIAL_REDDIT_BASE_URL || 'https://www.reddit.com/submit',
    },
    email: {
      protocol: process.env.SOCIAL_EMAIL_PROTOCOL || 'mailto:',
    },
  },

  // UTM Parameters
  utm: {
    defaults: {
      source: process.env.SOCIAL_UTM_SOURCE || 'social',
      medium: process.env.SOCIAL_UTM_MEDIUM || 'share',
      campaign: process.env.SOCIAL_UTM_CAMPAIGN || 'resource-sharing',
    },
  },

  // Share Button Settings
  buttons: {
    showLabels: process.env.SOCIAL_SHOW_LABELS !== 'false',
    openInNewTab: process.env.SOCIAL_OPEN_NEW_TAB !== 'false',
  },
} as const

export type SocialConfig = typeof socialConfig
