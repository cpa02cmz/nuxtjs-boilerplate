// Social Configuration - Social Media URLs and Sharing Settings
// Flexy hates hardcoded values! All social settings are now configurable.

export const socialConfig = {
  // Social Media Share URLs
  shareUrls: {
    twitter: {
      baseUrl:
        process.env.SHARE_TWITTER_URL || 'https://twitter.com/intent/tweet',
      params: {
        text: 'text',
        url: 'url',
        via: 'via',
      },
    },
    facebook: {
      baseUrl:
        process.env.SHARE_FACEBOOK_URL ||
        'https://www.facebook.com/sharer/sharer.php',
      params: {
        u: 'u',
      },
    },
    linkedin: {
      baseUrl:
        process.env.SHARE_LINKEDIN_URL ||
        'https://www.linkedin.com/sharing/share-offsite/',
      params: {
        url: 'url',
      },
    },
    reddit: {
      baseUrl: process.env.SHARE_REDDIT_URL || 'https://reddit.com/submit',
      params: {
        title: 'title',
        url: 'url',
      },
    },
    email: {
      baseUrl: process.env.SHARE_EMAIL_URL || 'mailto:',
      params: {
        subject: 'subject',
        body: 'body',
      },
    },
  },

  // Social Media Brand Colors (Tailwind classes)
  colors: {
    twitter: {
      bg: process.env.SOCIAL_TWITTER_BG || 'bg-blue-500',
      hover: process.env.SOCIAL_TWITTER_HOVER || 'hover:bg-blue-700',
    },
    facebook: {
      bg: process.env.SOCIAL_FACEBOOK_BG || 'bg-blue-800',
      hover: process.env.SOCIAL_FACEBOOK_HOVER || 'hover:bg-blue-900',
    },
    linkedin: {
      bg: process.env.SOCIAL_LINKEDIN_BG || 'bg-blue-600',
      hover: process.env.SOCIAL_LINKEDIN_HOVER || 'hover:bg-blue-800',
    },
    reddit: {
      bg: process.env.SOCIAL_REDDIT_BG || 'bg-orange-500',
      hover: process.env.SOCIAL_REDDIT_HOVER || 'hover:bg-orange-700',
    },
    email: {
      bg: process.env.SOCIAL_EMAIL_BG || 'bg-gray-500',
      hover: process.env.SOCIAL_EMAIL_HOVER || 'hover:bg-gray-700',
    },
    copy: {
      bg: process.env.SOCIAL_COPY_BG || 'bg-green-500',
      hover: process.env.SOCIAL_COPY_HOVER || 'hover:bg-green-700',
    },
  },

  // Share Text Templates
  shareText: {
    defaultTitle:
      process.env.SHARE_DEFAULT_TITLE || 'Check out this free resource',
    defaultDescription:
      process.env.SHARE_DEFAULT_DESCRIPTION ||
      'I found this amazing free resource on Free Stuff on the Internet',
    twitterPrefix:
      process.env.SHARE_TWITTER_PREFIX ||
      '🎉 Found this awesome free resource:',
  },

  // Social Media Handles
  handles: {
    twitter: process.env.SOCIAL_TWITTER_HANDLE || '@yourTwitterHandle',
    facebook: process.env.SOCIAL_FACEBOOK_PAGE || '',
    linkedin: process.env.SOCIAL_LINKEDIN_PAGE || '',
  },

  // Share Window Settings
  window: {
    width: parseInt(process.env.SHARE_WINDOW_WIDTH || '600'),
    height: parseInt(process.env.SHARE_WINDOW_HEIGHT || '400'),
    features:
      process.env.SHARE_WINDOW_FEATURES ||
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=600',
  },

  // User Agent for URL Validation
  userAgent: {
    validator:
      process.env.URL_VALIDATOR_USER_AGENT || 'NuxtResourceValidator/1.0',
  },
} as const

export type SocialConfig = typeof socialConfig
