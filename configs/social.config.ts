// Social Media Configuration - All social sharing settings
// Flexy hates hardcoded values! All social settings are now configurable.

export const socialConfig = {
  // Share Window Settings
  share: {
    windowWidth: parseInt(process.env.SOCIAL_SHARE_WINDOW_WIDTH || '600'),
    windowHeight: parseInt(process.env.SOCIAL_SHARE_WINDOW_HEIGHT || '400'),
  },

  // Social Media Platform URLs
  platforms: {
    twitter: {
      url: process.env.SOCIAL_TWITTER_URL || 'https://twitter.com/intent/tweet',
      params: {
        text: 'text',
        url: 'url',
      },
    },
    linkedin: {
      url:
        process.env.SOCIAL_LINKEDIN_URL ||
        'https://www.linkedin.com/sharing/share-offsite/',
      params: {
        url: 'url',
      },
    },
    facebook: {
      url:
        process.env.SOCIAL_FACEBOOK_URL ||
        'https://www.facebook.com/sharer/sharer.php',
      params: {
        u: 'u',
      },
    },
    reddit: {
      url: process.env.SOCIAL_REDDIT_URL || 'https://www.reddit.com/submit',
      params: {
        title: 'title',
        url: 'url',
      },
    },
    email: {
      url: process.env.SOCIAL_EMAIL_URL || 'mailto:',
      params: {
        subject: 'subject',
        body: 'body',
      },
    },
  },

  // Open Graph Settings
  openGraph: {
    defaultType: process.env.OG_DEFAULT_TYPE || 'website',
    siteName: process.env.OG_SITE_NAME || 'Free Stuff on the Internet',
  },

  // Twitter Card Settings
  twitter: {
    defaultCard: process.env.TWITTER_DEFAULT_CARD || 'summary',
    site: process.env.TWITTER_SITE || '@freestuff',
    creator: process.env.TWITTER_CREATOR || '@freestuff',
  },

  // API Endpoints
  endpoints: {
    trackShare: process.env.SOCIAL_API_TRACK_SHARE || '/api/v1/social/share',
    getCounts: process.env.SOCIAL_API_GET_COUNTS || '/api/v1/social/counts',
  },

  // Error Messages
  messages: {
    shareFailed: process.env.SOCIAL_MSG_SHARE_FAILED || 'Share failed',
    copyFailed: process.env.SOCIAL_MSG_COPY_FAILED || 'Copy failed',
    unsupportedPlatform:
      process.env.SOCIAL_MSG_UNSUPPORTED ||
      'Unsupported platform: {{platform}}',
  },

  // UTM Parameters
  utm: {
    source: process.env.SHARE_UTM_SOURCE || 'social',
    medium: process.env.SHARE_UTM_MEDIUM || 'share',
    campaign: process.env.SHARE_UTM_CAMPAIGN || 'resource-sharing',
  },
} as const

export type SocialConfig = typeof socialConfig
