import { z } from 'zod'
import {
  isValidCategory,
  isValidEventType,
  VALIDATION_CONFIG,
} from './constants'

export const validateUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  timeout: z
    .number()
    .int()
    .positive()
    .optional()
    .default(VALIDATION_CONFIG.urlValidation.timeout),
  retries: z
    .number()
    .int()
    .min(VALIDATION_CONFIG.urlValidation.retries.min)
    .max(VALIDATION_CONFIG.urlValidation.retries.max)
    .optional()
    .default(VALIDATION_CONFIG.urlValidation.retries.default),
  retryDelay: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(VALIDATION_CONFIG.urlValidation.retryDelay),
  useCircuitBreaker: z.boolean().optional().default(true),
})

export const createWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL format'),
  events: z.array(z.string()).min(1, 'At least one event is required'),
  active: z.boolean().optional(),
})

export const updateWebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL format').optional(),
  events: z
    .array(z.string())
    .min(1, 'At least one event is required')
    .optional(),
  active: z.boolean().optional(),
})

export const createSubmissionSchema = z.object({
  title: z
    .string()
    .min(VALIDATION_CONFIG.resource.name.minLength, 'Title is required')
    .max(VALIDATION_CONFIG.resource.name.maxLength, 'Title too long'),
  description: z
    .string()
    .min(
      VALIDATION_CONFIG.resource.description.minLength,
      `Description must be at least ${VALIDATION_CONFIG.resource.description.minLength} characters`
    )
    .max(
      VALIDATION_CONFIG.resource.description.maxLength,
      'Description too long'
    ),
  url: z.string().url('Invalid URL format'),
  category: z.string().min(1, 'Category is required'),
  tags: z
    .array(z.string())
    .max(VALIDATION_CONFIG.resource.tags.maxCount, 'Too many tags')
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
    .max(VALIDATION_CONFIG.resource.features.maxCount, 'Too many technologies')
    .optional()
    .default([]),
  benefits: z
    .array(z.string())
    .max(VALIDATION_CONFIG.resource.features.maxCount, 'Too many benefits')
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
    .min(VALIDATION_CONFIG.search.query.minLength, 'Search query is required')
    .max(VALIDATION_CONFIG.search.query.maxLength, 'Query too long'),
  category: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  pricingModel: z.enum(['Free', 'Freemium', 'Paid', 'Open Source']).optional(),
  technology: z.string().optional(),
  limit: z
    .number()
    .int()
    .min(VALIDATION_CONFIG.search.limit.min)
    .max(VALIDATION_CONFIG.search.limit.max)
    .optional()
    .default(VALIDATION_CONFIG.search.limit.default),
  offset: z.number().int().nonnegative().optional().default(0),
})

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(VALIDATION_CONFIG.apiKey.name.minLength, 'API key name is required')
    .max(VALIDATION_CONFIG.apiKey.name.maxLength, 'Name too long'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresIn: z.number().int().positive().optional(),
})

export const updateApiKeySchema = z.object({
  name: z
    .string()
    .min(VALIDATION_CONFIG.apiKey.name.minLength)
    .max(VALIDATION_CONFIG.apiKey.name.maxLength)
    .optional(),
  scopes: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
})

export const bulkStatusUpdateSchema = z.object({
  resourceIds: z
    .array(z.string())
    .min(1, 'At least one resource ID is required')
    .max(VALIDATION_CONFIG.bulk.maxResourceIds, 'Too many resources'),
  status: z.enum(['active', 'archived', 'deprecated']),
})

export const moderationActionSchema = z.object({
  reason: z
    .string()
    .min(
      VALIDATION_CONFIG.moderation.reason.minLength,
      `Reason must be at least ${VALIDATION_CONFIG.moderation.reason.minLength} characters`
    )
    .max(VALIDATION_CONFIG.moderation.reason.maxLength, 'Reason too long'),
  notes: z
    .string()
    .max(VALIDATION_CONFIG.moderation.notes.maxLength, 'Notes too long')
    .optional(),
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
    .max(50, 'Event type too long')
    .refine(
      val => isValidEventType(val),
      'Invalid event type. Must be one of: resource_view, search, filter_change, bookmark, comparison, submission, page_view, resource_click, advanced_search, zero_result_search, search_result_click, filter_applied, recommendation_click, resource_rating, time_spent, bookmark_action, resource_shared'
    ),
  resourceId: z
    .string()
    .max(25, 'Resource ID too long')
    .refine(
      val => val === '' || /^[a-zA-Z0-9_-]+$/.test(val),
      'Resource ID contains invalid characters'
    )
    .optional(),
  category: z
    .string()
    .max(100, 'Category too long')
    .refine(
      val => isValidCategory(val),
      'Invalid category. Must be one of: Development, Design, Productivity, Marketing, Analytics, Security, AI/ML, DevOps, Testing, Education'
    )
    .optional(),
  url: z.string().url('Invalid URL format').optional(),
  userAgent: z.string().max(500, 'User agent too long').optional(),
  ip: z
    .string()
    .max(45, 'IP address too long')
    .refine(val => {
      if (val === 'unknown') return true

      // IPv4 regex
      const ipv4Regex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

      // IPv6 regex supporting all valid formats including compressed notation
      // Matches: full, compressed (::), IPv4-mapped, and various valid combinations
      const ipv6Regex =
        /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?::[0-9a-fA-F]{1,4}){1,7}|::|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|::(?:[0-9a-fA-F]{1,4}:){0,5}(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})$/

      return ipv4Regex.test(val) || ipv6Regex.test(val)
    }, 'Invalid IP address format')
    .optional(),
  timestamp: z
    .union([z.string(), z.date(), z.number().int().positive()])
    .refine(val => val !== undefined, {
      message:
        'Invalid timestamp format. Must be string (ISO 8601), Date object, or number (Unix timestamp)',
    }),
  properties: z.record(z.string(), z.unknown()).optional(),
})
