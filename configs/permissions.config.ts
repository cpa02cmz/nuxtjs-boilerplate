// Permissions Configuration - Permission-related defaults
// Flexy hates hardcoded values! All permission defaults are now configurable.

export const permissionsConfig = {
  // API Key permissions
  apiKey: {
    // Default permissions for new API keys
    defaultPermissions: ['read'],

    // Available permission levels
    levels: {
      read: 'read',
      write: 'write',
      delete: 'delete',
      admin: 'admin',
    },
  },

  // Moderator permissions
  moderation: {
    // Default permissions for moderators
    defaultPermissions: ['read', 'write', 'moderate'],
  },

  // Resource permissions
  resource: {
    // Default permissions for resource operations
    defaultPermissions: ['read'],
  },
} as const

export type PermissionsConfig = typeof permissionsConfig
