// SEO Configuration - Search Engine Optimization Settings
// Flexy hates hardcoded values! All SEO settings are now configurable.

export const seoConfig = {
  // Default Meta Tags
  meta: {
    title:
      process.env.SEO_DEFAULT_TITLE ||
      'Free Stuff on the Internet - Free Resources for Developers',
    description:
      process.env.SEO_DEFAULT_DESCRIPTION ||
      'Discover amazing free resources available on the internet - from AI tools to hosting services.',
    keywords:
      process.env.SEO_KEYWORDS ||
      'free resources, AI tools, hosting, databases, CDN, VPS, web development',
    author: process.env.SEO_AUTHOR || 'Free Stuff on the Internet',
  },

  // Open Graph Settings
  og: {
    type: process.env.OG_TYPE || 'website',
    image: process.env.OG_IMAGE || '/og-image.jpg',
    imageWidth: parseInt(process.env.OG_IMAGE_WIDTH || '1200'),
    imageHeight: parseInt(process.env.OG_IMAGE_HEIGHT || '630'),
  },

  // Twitter Card Settings
  twitter: {
    card: process.env.TWITTER_CARD || 'summary_large_image',
    site: process.env.TWITTER_SITE || '@yourTwitterHandle',
    creator: process.env.TWITTER_CREATOR || '@yourTwitterHandle',
  },

  // Structured Data (JSON-LD)
  structuredData: {
    type: process.env.SCHEMA_TYPE || 'WebSite',
    name: process.env.SCHEMA_NAME || 'Free Stuff on the Internet',
    description:
      process.env.SCHEMA_DESCRIPTION ||
      'Discover amazing free resources available on the internet',
  },

  // Resource Schema Settings
  resourceSchema: {
    price: process.env.RESOURCE_PRICE || '0',
    currency: process.env.RESOURCE_CURRENCY || 'USD',
    ratingMin: parseInt(process.env.RESOURCE_RATING_MIN || '5'),
    ratingMax: parseInt(process.env.RESOURCE_RATING_MAX || '1'),
    ratingCount: parseInt(process.env.RESOURCE_RATING_COUNT || '10'),
  },

  // Schema.org URLs - Flexy hates hardcoded schema URLs!
  schema: {
    context: process.env.SCHEMA_CONTEXT_URL || 'https://schema.org',
    availability: {
      inStock:
        process.env.SCHEMA_AVAILABILITY_IN_STOCK ||
        'https://schema.org/InStock',
      outOfStock:
        process.env.SCHEMA_AVAILABILITY_OUT_OF_STOCK ||
        'https://schema.org/OutOfStock',
    },
    offerType: process.env.SCHEMA_OFFER_TYPE || 'Offer',
    softwareApplication:
      process.env.SCHEMA_SOFTWARE_APPLICATION || 'SoftwareApplication',
    webSite: process.env.SCHEMA_WEBSITE_TYPE || 'WebSite',
  },
}

export type SeoConfig = typeof seoConfig
