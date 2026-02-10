// Icons Configuration - Emoji and Icon Mappings
// Flexy hates hardcoded values! All icon mappings are now centralized.

export const iconsConfig = {
  // Activity Icons for moderation dashboard
  activity: {
    approve: '✅',
    reject: '❌',
    flag: '🚩',
    submit: '📝',
    default: 'ℹ️',
  },

  // Resource Status Icons
  status: {
    active: '🟢',
    inactive: '⚪',
    deprecated: '🟡',
    archived: '🔴',
    pending: '🟠',
  },

  // Feature Icons
  features: {
    bookmark: '🔖',
    share: '📤',
    compare: '⚖️',
    filter: '🔍',
    sort: '📊',
    search: '🔎',
    settings: '⚙️',
    delete: '🗑️',
    edit: '✏️',
    add: '➕',
    remove: '➖',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  },

  // Category Icons
  categories: {
    ai: '🤖',
    cloud: '☁️',
    database: '🗄️',
    development: '💻',
    design: '🎨',
    learning: '📚',
    productivity: '⚡',
    security: '🔒',
    analytics: '📈',
    marketing: '📢',
    other: '📦',
  },

  // Social Media Icons
  social: {
    twitter: '🐦',
    github: '🐙',
    discord: '💬',
    email: '📧',
    website: '🌐',
    rss: '📡',
  },

  // Navigation Icons
  navigation: {
    home: '🏠',
    back: '⬅️',
    forward: '➡️',
    up: '⬆️',
    down: '⬇️',
    menu: '☰',
    close: '✕',
    external: '↗️',
  },
} as const

export type IconsConfig = typeof iconsConfig
