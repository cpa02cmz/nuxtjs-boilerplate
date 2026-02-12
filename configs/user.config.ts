// User Configuration - Default User IDs and User-related Constants
// Flexy hates hardcoded values! All user identifiers are now configurable.

export interface SkillLevel {
  value: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  label: string
}

export const userConfig = {
  // Default user identifiers
  defaults: {
    // Default user ID for anonymous/unauthenticated users
    anonymousId: process.env.USER_DEFAULT_ANONYMOUS_ID || 'default-user',

    // System user ID for automated operations
    systemId: process.env.USER_DEFAULT_SYSTEM_ID || 'system',

    // Default moderator ID for moderation operations
    moderatorId: process.env.USER_DEFAULT_MODERATOR_ID || 'moderator_123',
  },

  // User roles
  roles: {
    admin: 'admin',
    moderator: 'moderator',
    user: 'user',
    anonymous: 'anonymous',
  },

  // Skill levels for user preferences
  skillLevels: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ] as SkillLevel[],

  // Available categories for user interests
  availableCategories: [
    'javascript',
    'typescript',
    'vue',
    'react',
    'angular',
    'svelte',
    'nuxt',
    'next',
    'nodejs',
    'python',
    'java',
    'csharp',
    'php',
    'mobile',
    'web-development',
    'backend',
    'frontend',
    'devops',
    'database',
    'testing',
    'design',
    'ai',
    'security',
  ] as string[],

  // User preferences defaults
  preferences: {
    // Default skill level for new users
    defaultSkillLevel: process.env.USER_DEFAULT_SKILL_LEVEL || 'intermediate',

    // Default categories for new users
    defaultCategories: ['javascript', 'vue', 'nuxt', 'web-development'],

    // Default technologies for new users
    defaultTechnologies: ['typescript', 'react', 'nodejs'],

    // Default interests for new users
    defaultInterests: ['frontend', 'backend', 'devops'],

    // Default notification settings
    defaultNotificationSettings: {
      resourceUpdates: true,
      newContent: true,
      weeklyDigest: true,
    },

    // Default privacy settings
    defaultPrivacySettings: {
      allowPersonalization: true,
      allowDataCollection: true,
      allowRecommendationExplanations: true,
    },
  },
} as const

export type UserConfig = typeof userConfig
