// AI Configuration - Provider settings, model configs, and prompt templates
// ai-agent-engineer: Centralized AI configuration for future integrations

/**
 * AI Provider Types
 */
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'cohere'
  | 'mistral'
  | 'custom'

/**
 * AI Model Configuration
 */
export interface AIModelConfig {
  /** Model identifier (e.g., 'gpt-4', 'claude-3-opus') */
  model: string
  /** Maximum tokens for completion */
  maxTokens: number
  /** Temperature for response randomness (0-2) */
  temperature: number
  /** Top-p sampling (0-1) */
  topP: number
  /** Stop sequences */
  stopSequences: string[]
}

/**
 * AI Provider Configuration
 */
export interface AIProviderConfig {
  /** Whether this provider is enabled */
  enabled: boolean
  /** API key environment variable name */
  apiKeyEnvVar: string
  /** Base URL for API calls */
  baseUrl: string
  /** Default model to use */
  defaultModel: string
  /** Available models */
  models: string[]
  /** Request timeout in milliseconds */
  timeout: number
  /** Maximum retries on failure */
  maxRetries: number
}

/**
 * Prompt Template Configuration
 */
export interface PromptTemplateConfig {
  /** System prompt for AI interactions */
  systemPrompt: string
  /** Maximum context length */
  maxContextLength: number
  /** Whether to include conversation history */
  includeHistory: boolean
  /** History window size (number of messages) */
  historyWindowSize: number
}

/**
 * Parse AI provider list from environment variable
 */
const parseEnabledProviders = (envValue: string | undefined): AIProvider[] => {
  if (!envValue) {
    return ['openai'] // Default to OpenAI
  }
  return envValue.split(',').map(p => p.trim() as AIProvider)
}

/**
 * OpenAI Provider Configuration
 */
const openaiConfig: AIProviderConfig = {
  enabled: process.env.AI_OPENAI_ENABLED !== 'false',
  apiKeyEnvVar: 'OPENAI_API_KEY',
  baseUrl: process.env.AI_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  defaultModel: process.env.AI_OPENAI_DEFAULT_MODEL || 'gpt-4-turbo-preview',
  models: [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
  ],
  timeout: parseInt(process.env.AI_OPENAI_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.AI_OPENAI_MAX_RETRIES || '3'),
}

/**
 * Anthropic Provider Configuration
 */
const anthropicConfig: AIProviderConfig = {
  enabled: process.env.AI_ANTHROPIC_ENABLED === 'true',
  apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  baseUrl: process.env.AI_ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
  defaultModel:
    process.env.AI_ANTHROPIC_DEFAULT_MODEL || 'claude-3-opus-20240229',
  models: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
  ],
  timeout: parseInt(process.env.AI_ANTHROPIC_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.AI_ANTHROPIC_MAX_RETRIES || '3'),
}

/**
 * Google AI Provider Configuration
 */
const googleConfig: AIProviderConfig = {
  enabled: process.env.AI_GOOGLE_ENABLED === 'true',
  apiKeyEnvVar: 'GOOGLE_AI_API_KEY',
  baseUrl:
    process.env.AI_GOOGLE_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta',
  defaultModel: process.env.AI_GOOGLE_DEFAULT_MODEL || 'gemini-pro',
  models: [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ],
  timeout: parseInt(process.env.AI_GOOGLE_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.AI_GOOGLE_MAX_RETRIES || '3'),
}

/**
 * Default Model Configuration
 */
const defaultModelConfig: AIModelConfig = {
  model: process.env.AI_DEFAULT_MODEL || 'gpt-4-turbo-preview',
  maxTokens: parseInt(process.env.AI_DEFAULT_MAX_TOKENS || '4096'),
  temperature: parseFloat(process.env.AI_DEFAULT_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.AI_DEFAULT_TOP_P || '1.0'),
  stopSequences:
    process.env.AI_DEFAULT_STOP_SEQUENCES?.split(',').map(s => s.trim()) || [],
}

/**
 * Default Prompt Template Configuration
 */
const defaultPromptConfig: PromptTemplateConfig = {
  systemPrompt:
    process.env.AI_DEFAULT_SYSTEM_PROMPT || 'You are a helpful assistant.',
  maxContextLength: parseInt(process.env.AI_MAX_CONTEXT_LENGTH || '8192'),
  includeHistory: process.env.AI_INCLUDE_HISTORY !== 'false',
  historyWindowSize: parseInt(process.env.AI_HISTORY_WINDOW_SIZE || '10'),
}

/**
 * Main AI Configuration Export
 */
export const aiConfig = {
  // Feature flags
  features: {
    /** Enable AI-powered search */
    searchEnabled: process.env.AI_SEARCH_ENABLED === 'true',
    /** Enable AI-powered recommendations */
    recommendationsEnabled: process.env.AI_RECOMMENDATIONS_ENABLED === 'true',
    /** Enable AI-powered content generation */
    contentGenerationEnabled:
      process.env.AI_CONTENT_GENERATION_ENABLED === 'true',
    /** Enable AI-powered chat */
    chatEnabled: process.env.AI_CHAT_ENABLED === 'true',
  },

  // Enabled providers
  enabledProviders: parseEnabledProviders(process.env.AI_ENABLED_PROVIDERS),

  // Provider configurations
  providers: {
    openai: openaiConfig,
    anthropic: anthropicConfig,
    google: googleConfig,
  },

  // Default model settings
  defaultModel: defaultModelConfig,

  // Prompt configuration
  prompts: defaultPromptConfig,

  // Rate limiting
  rateLimiting: {
    /** Maximum requests per minute */
    maxRequestsPerMinute: parseInt(
      process.env.AI_RATE_LIMIT_MAX_REQUESTS || '60'
    ),
    /** Maximum tokens per minute */
    maxTokensPerMinute: parseInt(
      process.env.AI_RATE_LIMIT_MAX_TOKENS || '150000'
    ),
    /** Request window in milliseconds */
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '60000'),
  },

  // Caching
  caching: {
    /** Enable response caching */
    enabled: process.env.AI_CACHE_ENABLED !== 'false',
    /** Cache TTL in seconds */
    ttlSeconds: parseInt(process.env.AI_CACHE_TTL_SECONDS || '3600'),
    /** Maximum cache size in bytes */
    maxSizeBytes: parseInt(process.env.AI_CACHE_MAX_SIZE_BYTES || '10485760'), // 10MB
  },

  // Error handling
  errorHandling: {
    /** Enable fallback to secondary provider */
    enableFallback: process.env.AI_ENABLE_FALLBACK === 'true',
    /** Fallback provider */
    fallbackProvider:
      (process.env.AI_FALLBACK_PROVIDER as AIProvider) || 'openai',
    /** Log errors to monitoring */
    logErrors: process.env.AI_LOG_ERRORS !== 'false',
  },

  // Analytics
  analytics: {
    /** Track AI usage metrics */
    trackUsage: process.env.AI_TRACK_USAGE !== 'false',
    /** Track token consumption */
    trackTokens: process.env.AI_TRACK_TOKENS !== 'false',
    /** Track latency */
    trackLatency: process.env.AI_TRACK_LATENCY !== 'false',
  },
} as const

export type AIConfig = typeof aiConfig

/**
 * Helper function to get API key for a provider
 */
export function getProviderApiKey(provider: AIProvider): string | undefined {
  const providerConfig =
    aiConfig.providers[provider as keyof typeof aiConfig.providers]
  if (!providerConfig) return undefined
  return process.env[providerConfig.apiKeyEnvVar]
}

/**
 * Helper function to check if a provider is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  const providerConfig =
    aiConfig.providers[provider as keyof typeof aiConfig.providers]
  if (!providerConfig) return false
  return providerConfig.enabled && !!getProviderApiKey(provider)
}
