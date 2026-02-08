import { z } from 'zod'
import { isValidCategory, isValidEventType } from './constants'
import { validationConfig } from '~/configs/validation.config'
import { errorMessagesConfig } from '~/configs/error-messages.config'

export const validateUrlSchema = z.object({
  url: z.string().url(errorMessagesConfig.validation.invalidUrl),
  timeout: z
    .number()
    .int()
    .positive()
    .optional()
    .default(validationConfig.url.timeout),
  retries: z.number().int().min(0).max(10).optional().default(3),
  retryDelay: z.number().int().nonnegative().optional().default(1000),
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
    .min(1, errorMessagesConfig.validation.required)
    .max(
      validationConfig.resource.name.maxLength,
      errorMessagesConfig.validation.tooLong(
        'Title',
        validationConfig.resource.name.maxLength
      )
    ),
  description: z
    .string()
    .min(
      validationConfig.resource.description.minLength,
      errorMessagesConfig.validation.tooShort(
        'Description',
        validationConfig.resource.description.minLength
      )
    )
    .max(
      validationConfig.resource.description.maxLength,
      errorMessagesConfig.validation.tooLong(
        'Description',
        validationConfig.resource.description.maxLength
      )
    ),
  url: z.string().url(errorMessagesConfig.validation.invalidUrl),
  category: z.string().min(1, errorMessagesConfig.validation.required),
  tags: z
    .array(z.string())
    .max(
      validationConfig.resource.tags.maxCount,
      errorMessagesConfig.submission.tooManyTags
    )
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
    .max(
      validationConfig.resource.tags.maxCount,
      errorMessagesConfig.submission.tooManyTechnologies
    )
    .optional()
    .default([]),
  benefits: z
    .array(z.string())
    .max(
      validationConfig.resource.features.maxCount,
      errorMessagesConfig.submission.tooManyBenefits
    )
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
    .min(1, errorMessagesConfig.search.queryRequired)
    .max(500, errorMessagesConfig.search.queryTooLong),
  category: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  pricingModel: z.enum(['Free', 'Freemium', 'Paid', 'Open Source']).optional(),
  technology: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().nonnegative().optional().default(0),
})

export const createApiKeySchema = z.object({
  name: z
    .string()
    .min(1, errorMessagesConfig.validation.required)
    .max(100, errorMessagesConfig.validation.tooLong('Name', 100)),
  scopes: z.array(z.string()).min(1, errorMessagesConfig.validation.required),
  expiresIn: z.number().int().positive().optional(),
})

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
})

export const bulkStatusUpdateSchema = z.object({
  resourceIds: z
    .array(z.string())
    .min(1, errorMessagesConfig.validation.required)
    .max(100, errorMessagesConfig.submission.tooManyTags),
  status: z.enum(['active', 'archived', 'deprecated']),
})

export const moderationActionSchema = z.object({
  reason: z
    .string()
    .min(10, errorMessagesConfig.moderation.reasonTooShort)
    .max(500, errorMessagesConfig.moderation.reasonTooLong),
  notes: z
    .string()
    .max(1000, errorMessagesConfig.moderation.notesTooLong)
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
    .min(1, errorMessagesConfig.validation.required)
    .max(50, errorMessagesConfig.validation.tooLong('Event type', 50))
    .refine(
      val => isValidEventType(val),
      errorMessagesConfig.validation.invalidCharacters
    ),
  resourceId: z
    .string()
    .max(25, errorMessagesConfig.validation.tooLong('Resource ID', 25))
    .refine(
      val => val === '' || /^[a-zA-Z0-9_-]+$/.test(val),
      errorMessagesConfig.validation.invalidCharacters
    )
    .optional(),
  category: z
    .string()
    .max(100, errorMessagesConfig.validation.tooLong('Category', 100))
    .refine(
      val => isValidCategory(val),
      errorMessagesConfig.validation.invalidCharacters
    )
    .optional(),
  url: z.string().url(errorMessagesConfig.validation.invalidUrl).optional(),
  userAgent: z
    .string()
    .max(500, errorMessagesConfig.validation.tooLong('User agent', 500))
    .optional(),
  ip: z
    .string()
    .max(45, errorMessagesConfig.validation.tooLong('IP address', 45))
    .refine(val => {
      const ipv4Regex =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      const ipv6Regex =
        /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^:(?::[0-9a-fA-F]{1,4}){1,7}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,7}|(?:[0-9a-fA-F]{1,4}:){1,7}:|:(?::[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$/
      return ipv4Regex.test(val) || ipv6Regex.test(val) || val === 'unknown'
    }, errorMessagesConfig.validation.invalidCharacters)
    .optional(),
  timestamp: z
    .union([z.string(), z.date(), z.number().int().positive()])
    .refine(val => val !== undefined, {
      message:
        'Invalid timestamp format. Must be string (ISO 8601), Date object, or number (Unix timestamp)',
    }),
  properties: z.record(z.string(), z.unknown()).optional(),
})
