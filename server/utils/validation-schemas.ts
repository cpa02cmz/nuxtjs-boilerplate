import { z } from 'zod'
import { isIPv6 } from 'node:net'
import { isValidCategory, isValidEventType } from './constants'
import { limitsConfig } from '../../configs/limits.config'

export const validateUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  timeout: z
    .number()
    .int()
    .positive()
    .max(
      limitsConfig.validation.urlValidationMaxTimeout,
      `Timeout cannot exceed ${limitsConfig.validation.urlValidationMaxTimeout}ms`
    )
    .optional()
    .default(limitsConfig.validation.urlValidationTimeout),
  retries: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .default(limitsConfig.validation.urlValidationRetries),
  retryDelay: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(limitsConfig.validation.urlValidationRetryDelay),
  useCircuitBreaker: z.boolean().optional().default(true),
})

export const createWebhookSchema = z.object({
  url: z
    .string()
    .url('Invalid webhook URL format')
    .refine(
      url => url.startsWith('https://'),
      'Webhook URL must use HTTPS protocol for security'
    ),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  active: z.boolean().optional(),
})

export const updateWebhookSchema = z.object({
  url: z
    .string()
    .url('Invalid webhook URL format')
    .refine(
      url => url.startsWith('https://'),
      'Webhook URL must use HTTPS protocol for security'
    )
    .optional(),
  events: z
    .array(z.string())
    .min(1, 'At least one event is required')
    .optional(),
  active: z.boolean().optional(),
})

export const createSubmissionSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(limitsConfig.validation.resourceTitleMaxLength, 'Title too long'),
  description: z
    .string()
    .min(
      limitsConfig.validation.resourceDescriptionMinLength,
      'Description must be at least 10 characters'
    )
    .max(
      limitsConfig.validation.resourceDescriptionMaxLength,
      'Description too long'
    ),
  url: z.string().url('Invalid URL format'),
  category: z.string().min(1, 'Category is required'),
  tags: z
    .array(z.string())
    .max(limitsConfig.validation.tagsMaxCount, 'Too many tags')
    .optional()
    .default([]),
  pricingModel: z
    .enum(['Free', 'Freemium', 'Paid', 'Open Source'])
    .optional()
    .default('Free'),
  difficulty: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .optional()
    .default('Beginner'),
  technology: z
    .array(z.string())
    .max(limitsConfig.validation.technologiesMaxCount, 'Too many technologies')
    .optional()
    .default([]),
  benefits: z
    .array(z.string())
    .max(limitsConfig.validation.benefitsMaxCount, 'Too many benefits')
    .optional()
    .default([]),
})

export const updateUserPreferencesSchema = z.object({
  categories: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .optional(),
  interests: z.array(z.string()).optional(),
  notificationSettings: z
    .object({
      resourceUpdates: z.boolean().optional(),
      newContent: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
    })
    .optional(),
  privacySettings: z
    .object({
      allowPersonalization: z.boolean().optional(),
      allowDataCollection: z.boolean().optional(),
      allowRecommendationExplanations: z.boolean().optional(),
    })
    .optional(),
})

export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(limitsConfig.validation.searchQueryMaxLength, 'Query too long'),
  category: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  pricingModel: z.enum(['Free', 'Freemium', 'Paid', 'Open Source']).optional(),
  technology: z.string().optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(limitsConfig.validation.searchMaxLimit)
    .optional()
    .default(limitsConfig.validation.searchDefaultLimit),
  offset: z.number().int().nonnegative().optional().default(0),
})

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(limitsConfig.validation.apiKeyNameMaxLength, 'Name too long'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresIn: z.number().int().positive().optional(),
})

export const updateApiKeySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(limitsConfig.validation.apiKeyNameMaxLength)
    .optional(),
  scopes: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
})

export const bulkStatusUpdateSchema = z.object({
  resourceIds: z
    .array(z.string())
    .min(1, 'At least one resource ID is required')
    .max(limitsConfig.validation.bulkMaxResources, 'Too many resources'),
  status: z.enum([
    'active',
    'deprecated',
    'discontinued',
    'updated',
    'pending',
  ]),
})

export const moderationActionSchema = z.object({
  reason: z
    .string()
    .min(
      limitsConfig.validation.moderationReasonMinLength,
      'Reason must be at least 10 characters'
    )
    .max(limitsConfig.validation.moderationReasonMaxLength, 'Reason too long'),
  notes: z
    .string()
    .max(limitsConfig.validation.moderationNotesMaxLength, 'Notes too long')
    .optional(),
})

export const resourceStatusUpdateSchema = z.object({
  status: z.enum([
    'active',
    'deprecated',
    'discontinued',
    'updated',
    'pending',
  ]),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export const flagResourceSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  reason: z
    .string()
    .min(1, 'Flag reason is required')
    .max(500, 'Reason too long'),
  reportedBy: z.string().min(1, 'Reporter ID is required'),
})

export const triggerWebhookSchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  data: z.unknown().optional(),
  idempotencyKey: z.string().optional(),
})

export const analyticsEventSchema = z.object({
  type: z
    .string()
    .min(1, 'Event type is required')
    .max(limitsConfig.validation.eventTypeMaxLength, 'Event type too long')
    .refine(
      val => isValidEventType(val),
      'Invalid event type. Must be one of: resource_view, search, filter_change, bookmark, comparison, submission, page_view, resource_click, advanced_search, zero_result_search, search_result_click, filter_applied, recommendation_click, resource_rating, time_spent, bookmark_action, resource_shared'
    ),
  resourceId: z
    .string()
    .max(limitsConfig.validation.resourceIdMaxLength, 'Resource ID too long')
    .refine(
      val => !val || /^[a-zA-Z0-9_-]+$/.test(val),
      'Resource ID contains invalid characters'
    )
    .optional()
    .transform(val => val || undefined),
  category: z
    .string()
    .max(limitsConfig.validation.categoryMaxLength, 'Category too long')
    .refine(
      val => isValidCategory(val),
      'Invalid category. Must be one of: Development, Design, Productivity, Marketing, Analytics, Security, AI/ML, DevOps, Testing, Education'
    )
    .optional(),
  url: z
    .string()
    .refine(
      val => {
        // Allow relative paths (e.g., "/", "/search", "/about")
        if (val.startsWith('/')) {
          return true
        }
        // Allow absolute URLs
        try {
          new URL(val)
          return true
        } catch {
          return false
        }
      },
      { message: 'Invalid URL format' }
    )
    .optional(),
  userAgent: z
    .string()
    .max(limitsConfig.validation.userAgentMaxLength, 'User agent too long')
    .optional(),
  ip: z
    .string()
    .max(limitsConfig.validation.ipAddressMaxLength, 'IP address too long')
    .refine(val => {
      if (val === 'unknown') return true

      // Allow hashed IP format (hash_ + 16 hex chars)
      if (val.startsWith('hash_') && /^hash_[a-f0-9]{16}$/.test(val)) {
        return true
      }

      // IPv4 regex
      const ipv4Regex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

      return ipv4Regex.test(val) || isIPv6(val)
    }, 'Invalid IP address format')
    .optional(),
  timestamp: z.union([z.string(), z.date(), z.number().int().positive()]),
  properties: z.record(z.string(), z.unknown()).optional(),
})
