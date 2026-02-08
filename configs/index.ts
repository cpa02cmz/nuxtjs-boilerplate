/**
 * Configuration Index
 * Centralized exports for all configuration modules
 * Flexy says: "Import configs from one place!"
 */

// App configuration
export * from './app.config'

// Theme configuration
export * from './theme.config'

// UI Text configuration
export * from './ui-text.config'

// Search configuration
export * from './search.config'

// Recommendation configuration
export * from './recommendation.config'

// Validation configuration
export * from './validation.config'

// Re-export as default object
export { default as app } from './app.config'
export { default as theme } from './theme.config'
export { default as uiText } from './ui-text.config'
export { default as search } from './search.config'
export { default as recommendation } from './recommendation.config'
export { default as validation } from './validation.config'
