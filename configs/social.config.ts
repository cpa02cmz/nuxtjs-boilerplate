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
        title: 'title',
        summary: 'summary',
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

  // URL Builders - Flexy hates hardcoded URL construction!
  urlBuilders: {
    twitter: (title: string, description: string, url: string): string => {
      const text = encodeURIComponent(`${title} - ${description}`)
      const encodedUrl = encodeURIComponent(url)
      return `${socialConfig.platforms.twitter.url}?text=${text}&url=${encodedUrl}`
    },
    facebook: (url: string): string => {
      const encodedUrl = encodeURIComponent(url)
      return `${socialConfig.platforms.facebook.url}?u=${encodedUrl}`
    },
    linkedin: (title: string, description: string, url: string): string => {
      const encodedUrl = encodeURIComponent(url)
      const encodedTitle = encodeURIComponent(title)
      const encodedSummary = encodeURIComponent(description)
      return `${socialConfig.platforms.linkedin.url}?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`
    },
    reddit: (title: string, url: string): string => {
      const encodedTitle = encodeURIComponent(title)
      const encodedUrl = encodeURIComponent(url)
      return `${socialConfig.platforms.reddit.url}?title=${encodedTitle}&url=${encodedUrl}`
    },
    email: (title: string, description: string, url: string): string => {
      const subject = encodeURIComponent(`Check out: ${title}`)
      const body = encodeURIComponent(`${description}\n\n${url}`)
      return `${socialConfig.platforms.email.url}?subject=${subject}&body=${body}`
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

  // Platform Styling - Flexy hates hardcoded colors!
  // Tailwind CSS classes for social platform buttons/icons
  platformStyles: {
    twitter: {
      button: {
        bg: process.env.STYLE_TWITTER_BG || 'bg-blue-500',
        hover: process.env.STYLE_TWITTER_HOVER || 'hover:bg-blue-600',
        text: process.env.STYLE_TWITTER_TEXT || 'text-white',
      },
      icon: {
        color: process.env.STYLE_TWITTER_ICON || 'text-blue-400',
      },
    },
    facebook: {
      button: {
        bg: process.env.STYLE_FACEBOOK_BG || 'bg-blue-700',
        hover: process.env.STYLE_FACEBOOK_HOVER || 'hover:bg-blue-800',
        text: process.env.STYLE_FACEBOOK_TEXT || 'text-white',
      },
      icon: {
        color: process.env.STYLE_FACEBOOK_ICON || 'text-blue-600',
      },
    },
    linkedin: {
      button: {
        bg: process.env.STYLE_LINKEDIN_BG || 'bg-blue-800',
        hover: process.env.STYLE_LINKEDIN_HOVER || 'hover:bg-blue-900',
        text: process.env.STYLE_LINKEDIN_TEXT || 'text-white',
      },
      icon: {
        color: process.env.STYLE_LINKEDIN_ICON || 'text-blue-700',
      },
    },
    reddit: {
      button: {
        bg: process.env.STYLE_REDDIT_BG || 'bg-orange-500',
        hover: process.env.STYLE_REDDIT_HOVER || 'hover:bg-orange-600',
        text: process.env.STYLE_REDDIT_TEXT || 'text-white',
      },
      icon: {
        color: process.env.STYLE_REDDIT_ICON || 'text-orange-500',
      },
    },
    email: {
      button: {
        bg: process.env.STYLE_EMAIL_BG || 'bg-gray-600',
        hover: process.env.STYLE_EMAIL_HOVER || 'hover:bg-gray-700',
        text: process.env.STYLE_EMAIL_TEXT || 'text-white',
      },
      icon: {
        color: process.env.STYLE_EMAIL_ICON || 'text-gray-600',
      },
    },
    copy: {
      button: {
        bg: process.env.STYLE_COPY_BG || 'bg-gray-600',
        hover: process.env.STYLE_COPY_HOVER || 'hover:bg-gray-700',
        text: process.env.STYLE_COPY_TEXT || 'text-white',
      },
      icon: {
        color: process.env.STYLE_COPY_ICON || 'text-gray-600',
        success: process.env.STYLE_COPY_SUCCESS || 'text-green-600',
      },
    },
    shareButton: {
      bg: process.env.STYLE_SHARE_BG || 'hover:bg-gray-100',
      text: process.env.STYLE_SHARE_TEXT || 'text-gray-600',
      ring: process.env.STYLE_SHARE_RING || 'focus:ring-blue-500',
      activeBg: process.env.STYLE_SHARE_ACTIVE_BG || '#e5e7eb',
    },
  },

  // Dropdown Menu Styling
  dropdown: {
    container:
      process.env.STYLE_DROPDOWN_CONTAINER ||
      'absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5',
    item:
      process.env.STYLE_DROPDOWN_ITEM ||
      'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
    position: process.env.STYLE_DROPDOWN_POSITION || 'right-0 origin-top-right',
  },
} as const

export type SocialConfig = typeof socialConfig
