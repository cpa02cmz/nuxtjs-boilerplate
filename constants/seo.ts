/**
 * SEO Constants
 * Search engine optimization configuration
 * Flexy approves - centralized SEO management!
 */

import {
  APP_NAME,
  APP_DESCRIPTION,
  OG_IMAGE_PATH,
  OG_IMAGE_DIMENSIONS,
} from './app'

// SEO Configuration object
export const SEO_CONFIG = {
  title: `${APP_NAME} - Free Resources for Developers`,
  description: APP_DESCRIPTION,
  keywords: [
    'free resources',
    'AI tools',
    'hosting',
    'databases',
    'CDN',
    'VPS',
    'web development',
  ],
  author: APP_NAME,
  og: {
    title: `${APP_NAME} - Free Resources for Developers`,
    description: APP_DESCRIPTION,
    type: 'website',
    image: OG_IMAGE_PATH,
    imageWidth: OG_IMAGE_DIMENSIONS.width,
    imageHeight: OG_IMAGE_DIMENSIONS.height,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Free Resources for Developers`,
    description: APP_DESCRIPTION,
  },
} as const

// Social media handles
export const SOCIAL_HANDLES = {
  twitter: '@yourTwitterHandle',
} as const

// Structured data schemas
export const SCHEMA_TYPES = {
  website: 'WebSite',
  searchAction: 'SearchAction',
} as const

// Viewport configuration
export const VIEWPORT_CONFIG =
  'width=device-width, initial-scale=1, viewport-fit=cover' as const

// Meta tag values
export const META_TAGS = {
  referrer: 'no-referrer',
  formatDetection: 'telephone=no',
  msApplicationTileColor: '#ffffff',
} as const

// JSON-LD Context
export const JSON_LD_CONTEXT = 'https://schema.org' as const
