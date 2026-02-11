// Icons Configuration - Emoji and Icon Mappings
// Flexy hates hardcoded values! All icon mappings are now centralized.

export const iconsConfig = {
  // SVG Paths - Flexy hates hardcoded SVG paths in components!
  svg: {
    // Error/Warning Icons (Outline style)
    error:
      process.env.ICONS_PATH_ERROR ||
      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    warning:
      process.env.ICONS_PATH_WARNING ||
      'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info:
      process.env.ICONS_PATH_INFO ||
      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: process.env.ICONS_PATH_SUCCESS || 'M5 13l4 4L19 7',

    // Filled Icons for Toast Notifications (20x20 viewBox) - Flexy hates hardcoded paths!
    filled: {
      success:
        process.env.ICONS_PATH_FILLED_SUCCESS ||
        'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
      error:
        process.env.ICONS_PATH_FILLED_ERROR ||
        'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
      warning:
        process.env.ICONS_PATH_FILLED_WARNING ||
        'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
      info:
        process.env.ICONS_PATH_FILLED_INFO ||
        'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
      close:
        process.env.ICONS_PATH_FILLED_CLOSE ||
        'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
    },

    // Navigation Icons
    menu: process.env.ICONS_PATH_MENU || 'M4 6h16M4 12h16M4 18h16',
    close: process.env.ICONS_PATH_CLOSE || 'M6 18L18 6M6 6l12 12',
    back: process.env.ICONS_PATH_BACK || 'M10 19l-7-7m0 0l7-7m-7 7h18',
    forward: process.env.ICONS_PATH_FORWARD || 'M14 5l7 7m0 0l-7 7m7-7H3',

    // Action Icons
    search:
      process.env.ICONS_PATH_SEARCH ||
      'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    filter:
      process.env.ICONS_PATH_FILTER ||
      'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    bookmark:
      process.env.ICONS_PATH_BOOKMARK ||
      'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
    bookmarkOutline:
      process.env.ICONS_PATH_BOOKMARK_OUTLINE ||
      'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
    share:
      process.env.ICONS_PATH_SHARE ||
      'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
    copy:
      process.env.ICONS_PATH_COPY ||
      'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    trash:
      process.env.ICONS_PATH_TRASH ||
      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    edit:
      process.env.ICONS_PATH_EDIT ||
      'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',

    // Social Icons
    twitter:
      process.env.ICONS_PATH_TWITTER ||
      'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
    facebook:
      process.env.ICONS_PATH_FACEBOOK ||
      'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
    linkedin:
      process.env.ICONS_PATH_LINKEDIN ||
      'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z',
    reddit:
      process.env.ICONS_PATH_REDDIT ||
      'M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 01-.231.094.333.333 0 01-.236-.095.334.334 0 01.095-.238c1.42-1.075 3.37-1.17 3.674-1.17.305 0 2.255.095 3.675 1.17a.334.334 0 01.094.238.333.333 0 01-.095.235.327.327 0 01-.236.095c-.24 0-2.113-.582-3.438-.582-1.326 0-3.2.582-3.438.582a.327.327 0 01-.236-.095.334.334 0 01.058-.201l.004.001z',

    // Loading Spinner
    spinner:
      process.env.ICONS_PATH_SPINNER ||
      'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',

    // Clock/Time
    clock:
      process.env.ICONS_PATH_CLOCK ||
      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',

    // Sync
    sync:
      process.env.ICONS_PATH_SYNC ||
      'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',

    // Sparkles
    sparkles:
      process.env.ICONS_PATH_SPARKLES ||
      'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },

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
