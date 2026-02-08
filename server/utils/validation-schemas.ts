import { z } from 'zod'
import { isValidCategory, isValidEventType } from './constants'
import {
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
  PRICING_MODELS,
  DIFFICULTY_LEVELS,
  SKILL_LEVELS,
  RESOURCE_STATUSES,
  VALIDATION_PATTERNS,
} from '~/constants/validation'
import { PAGINATION } from '~/constants/ui'
import { REQUEST_CONFIG } from '~/constants/api'

export const validateUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  timeout: z
    .number()
    .int()
    .positive()
    .optional()
    .default(REQUEST_CONFIG.defaultTimeout),
  retries: z
    .number()
    .int()
    .min(0)
    .max(REQUEST_CONFIG.maxRetries)
    .optional()
    .default(REQUEST_CONFIG.defaultRetries),
  retryDelay: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(REQUEST_CONFIG.defaultRetryDelay),
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
    .min(VALIDATION_LIMITS.titleMinLength, VALIDATION_MESSAGES.titleRequired)
    .max(VALIDATION_LIMITS.titleMaxLength, VALIDATION_MESSAGES.titleTooLong),
  description: z
    .string()
    .min(
      VALIDATION_LIMITS.descriptionMinLength,
      VALIDATION_MESSAGES.descriptionTooShort
    )
    .max(
      VALIDATION_LIMITS.descriptionMaxLength,
      VALIDATION_MESSAGES.descriptionTooLong
    ),
  url: z.string().url('Invalid URL format'),
  category: z.string().min(1, VALIDATION_MESSAGES.categoryRequired),
  tags: z
    .array(z.string())
    .max(VALIDATION_LIMITS.maxTags, VALIDATION_MESSAGES.tooManyTags)
    .optional()
    .default([]),
  pricingModel: z
    .enum([
      PRICING_MODELS[0],
      PRICING_MODELS[1],
      PRICING_MODELS[2],
      PRICING_MODELS[3],
    ])
    .optional()
    .default('Free'),
  difficulty: z
    .enum([DIFFICULTY_LEVELS[0], DIFFICULTY_LEVELS[1], DIFFICULTY_LEVELS[2]])
    .optional()
    .default('Beginner'),
  technology: z
    .array(z.string())
    .max(
      VALIDATION_LIMITS.maxTechnologies,
      VALIDATION_MESSAGES.tooManyTechnologies
    )
    .optional()
    .default([]),
  benefits: z
    .array(z.string())
    .max(VALIDATION_LIMITS.maxBenefits, VALIDATION_MESSAGES.tooManyBenefits)
    .optional()
    .default([]),
})

export const updateUserPreferencesSchema = z.object({
  categories: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  skillLevel: z
    .enum([SKILL_LEVELS[0], SKILL_LEVELS[1], SKILL_LEVELS[2], SKILL_LEVELS[3]])
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
    .min(VALIDATION_LIMITS.minQueryLength, VALIDATION_MESSAGES.queryRequired)
    .max(VALIDATION_LIMITS.maxQueryLength, VALIDATION_MESSAGES.queryTooLong),
  category: z.string().optional(),
  difficulty: z
    .enum([DIFFICULTY_LEVELS[0], DIFFICULTY_LEVELS[1], DIFFICULTY_LEVELS[2]])
    .optional(),
  pricingModel: z
    .enum([
      PRICING_MODELS[0],
      PRICING_MODELS[1],
      PRICING_MODELS[2],
      PRICING_MODELS[3],
    ])
    .optional(),
  technology: z.string().optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(PAGINATION.maxPageSize)
    .optional()
    .default(PAGINATION.defaultPageSize),
  offset: z.number().int().nonnegative().optional().default(0),
})

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(VALIDATION_LIMITS.apiKeyNameMaxLength, 'Name too long'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresIn: z.number().int().positive().optional(),
})

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(VALIDATION_LIMITS.apiKeyNameMaxLength).optional(),
  scopes: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
})

export const bulkStatusUpdateSchema = z.object({
  resourceIds: z
    .array(z.string())
    .min(1, 'At least one resource ID is required')
    .max(VALIDATION_LIMITS.maxResourceIds, 'Too many resources'),
  status: z.enum([
    RESOURCE_STATUSES[0],
    RESOURCE_STATUSES[1],
    RESOURCE_STATUSES[2],
  ]),
})

export const moderationActionSchema = z.object({
  reason: z
    .string()
    .min(
      VALIDATION_LIMITS.reasonMinLength,
      'Reason must be at least 10 characters'
    )
    .max(VALIDATION_LIMITS.reasonMaxLength, 'Reason too long'),
  notes: z
    .string()
    .max(VALIDATION_LIMITS.notesMaxLength, 'Notes too long')
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
    .max(VALIDATION_LIMITS.maxEventTypeLength, 'Event type too long')
    .refine(
      val => isValidEventType(val),
      'Invalid event type. Must be one of: resource_view, search, filter_change, bookmark, comparison, submission'
    ),
  resourceId: z
    .string()
    .max(VALIDATION_LIMITS.maxResourceIdLength, 'Resource ID too long')
    .refine(
      val => val === '' || VALIDATION_PATTERNS.resourceId.test(val),
      'Resource ID contains invalid characters'
    )
    .optional(),
  category: z
    .string()
    .max(VALIDATION_LIMITS.maxCategoryLength, 'Category too long')
    .refine(
      val => isValidCategory(val),
      'Invalid category. Must be one of: Development, Design, Productivity, Marketing, Analytics, Security, AI/ML, DevOps, Testing, Education'
    )
    .optional(),
  url: z.string().url('Invalid URL format').optional(),
  userAgent: z
    .string()
    .max(VALIDATION_LIMITS.maxUserAgentLength, 'User agent too long')
    .optional(),
  ip: z
    .string()
    .max(VALIDATION_LIMITS.maxIpLength, 'IP address too long')
    .refine(val => {
      return (
        VALIDATION_PATTERNS.ipv4.test(val) ||
        VALIDATION_PATTERNS.ipv6.test(val) ||
        val === 'unknown'
      )
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
