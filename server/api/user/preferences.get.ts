import { getQuery } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { userConfig } from '~/configs/user.config'

export default defineEventHandler(async event => {
  await rateLimit(event)
  try {
    const query = getQuery(event)
    const userId = (query.userId as string) || userConfig.defaults.anonymousId

    const mockPreferences = {
      id: userId,
      categories: userConfig.preferences.defaultCategories,
      technologies: userConfig.preferences.defaultTechnologies,
      skillLevel: userConfig.preferences.defaultSkillLevel,
      interests: userConfig.preferences.defaultInterests,
      notificationSettings: userConfig.preferences.defaultNotificationSettings,
      privacySettings: userConfig.preferences.defaultPrivacySettings,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    return sendSuccessResponse(event, { preferences: mockPreferences })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
