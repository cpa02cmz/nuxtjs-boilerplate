// Marketing Configuration - UTM Parameters, Social Sharing, and Campaign Settings
// Flexy hates hardcoded values! All marketing settings are now configurable.

export const marketingConfig = {
  // UTM Parameters
  utm: {
    source: process.env.MARKETING_UTM_SOURCE || 'freestuffontheinternet',
    medium: process.env.MARKETING_UTM_MEDIUM || 'social_share',
    campaign: process.env.MARKETING_UTM_CAMPAIGN || 'resource-sharing',
  },

  // Social Sharing
  social: {
    twitter: {
      hashtags:
        process.env.MARKETING_TWITTER_HASHTAGS ||
        'FreeResources,WebDevelopment',
      via: process.env.MARKETING_TWITTER_VIA || 'freestuffontheinternet',
    },
    facebook: {
      appId: process.env.MARKETING_FACEBOOK_APP_ID || '',
    },
    linkedin: {
      source: process.env.MARKETING_LINKEDIN_SOURCE || 'freestuffontheinternet',
    },
  },

  // Share Text Templates
  shareText: {
    resource: {
      twitter:
        process.env.MARKETING_SHARE_RESOURCE_TWITTER ||
        'Check out this amazing free resource: {{title}} - {{url}}',
      facebook:
        process.env.MARKETING_SHARE_RESOURCE_FACEBOOK ||
        'Check out this amazing free resource: {{title}}',
      linkedin:
        process.env.MARKETING_SHARE_RESOURCE_LINKEDIN ||
        'Check out this amazing free resource: {{title}} - {{url}}',
      email: {
        subject:
          process.env.MARKETING_SHARE_EMAIL_SUBJECT ||
          'Check out this free resource: {{title}}',
        body:
          process.env.MARKETING_SHARE_EMAIL_BODY ||
          'I found this great free resource and thought you might be interested:\n\n{{title}}\n{{url}}\n\n{{description}}',
      },
    },
    comparison: {
      twitter:
        process.env.MARKETING_SHARE_COMPARISON_TWITTER ||
        'Comparing these free resources - check it out: {{url}}',
      facebook:
        process.env.MARKETING_SHARE_COMPARISON_FACEBOOK ||
        'Comparing these free resources - check it out',
      linkedin:
        process.env.MARKETING_SHARE_COMPARISON_LINKEDIN ||
        'Comparing these free resources - check it out: {{url}}',
      email: {
        subject:
          process.env.MARKETING_SHARE_COMPARISON_EMAIL_SUBJECT ||
          'Resource comparison - Free resources',
        body:
          process.env.MARKETING_SHARE_COMPARISON_EMAIL_BODY ||
          'I found these great free resources and compared them:\n\n{{url}}',
      },
    },
  },

  // Copy Messages
  copyMessages: {
    success: process.env.MARKETING_COPY_SUCCESS || 'Copied to clipboard!',
    error: process.env.MARKETING_COPY_ERROR || 'Failed to copy to clipboard',
  },

  // Email Configuration
  email: {
    subjectMaxLength: parseInt(
      process.env.MARKETING_EMAIL_SUBJECT_MAX_LENGTH || '100'
    ),
    bodyMaxLength: parseInt(
      process.env.MARKETING_EMAIL_BODY_MAX_LENGTH || '1000'
    ),
  },

  // URL Shortening (if implemented)
  urlShortening: {
    enabled: process.env.MARKETING_URL_SHORTENING_ENABLED === 'true',
    service: process.env.MARKETING_URL_SHORTENING_SERVICE || 'bitly',
  },

  // Campaign Tracking
  campaigns: {
    default: process.env.MARKETING_CAMPAIGN_DEFAULT || 'organic',
    resourceShare:
      process.env.MARKETING_CAMPAIGN_RESOURCE_SHARE || 'resource-sharing',
    comparisonShare:
      process.env.MARKETING_CAMPAIGN_COMPARISON_SHARE || 'comparison-sharing',
    socialShare:
      process.env.MARKETING_CAMPAIGN_SOCIAL_SHARE || 'social-sharing',
  },
} as const

export type MarketingConfig = typeof marketingConfig
