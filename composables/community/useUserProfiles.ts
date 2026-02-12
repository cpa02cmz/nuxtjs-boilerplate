/**
 * Composable for user profile management
 * Handles user creation, updates, and queries with O(1) lookups
 */
import { ref, computed } from 'vue'
import { generateUniqueId } from '~/utils/generateId'
import {
  addToArrayMap,
  updateInArrayMap,
  initializeMapFromArray,
} from '~/utils/collection-utils'
import type {
  UserProfile,
  CreateUserData,
  UpdateUserData,
} from '~/types/community'
import { limitsConfig } from '~/configs/limits.config'

export const useUserProfiles = (initialUsers: UserProfile[] = []) => {
  const users = ref<UserProfile[]>([...initialUsers])
  const userMap = ref<Map<string, UserProfile>>(
    initializeMapFromArray(initialUsers)
  )

  const currentUser = ref<UserProfile | null>(null)

  const setCurrentUser = (user: UserProfile | null) => {
    currentUser.value = user
  }

  const createProfile = (userData: CreateUserData): UserProfile => {
    const profile: UserProfile = {
      id: generateUniqueId(),
      name: userData.name,
      email: userData.email,
      username: userData.username,
      role: userData.role || 'user',
      isModerator: false,
      joinDate: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      reputation: limitsConfig.community.initialReputation,
      contributions: limitsConfig.community.initialContributions,
      contributionsDetail: {
        comments: limitsConfig.community.initialContributions,
        resources: limitsConfig.community.initialContributions,
        votes: limitsConfig.community.initialContributions,
      },
      privacy: {
        showEmail: false,
        showActivity: true,
      },
    }

    addToArrayMap(users, userMap, profile)

    return profile
  }

  const updateProfile = (
    userId: string,
    updates: UpdateUserData
  ): UserProfile | null => {
    const user = userMap.value.get(userId)
    if (!user) return null

    const updatedUser = {
      ...user,
      ...updates,
      privacy: updates.privacy
        ? { ...user.privacy, ...updates.privacy }
        : user.privacy,
    }

    updateInArrayMap(users, userMap, userId, updatedUser)

    return updatedUser
  }

  const incrementContributions = (
    userId: string,
    type: 'comments' | 'resources' | 'votes',
    amount: number = limitsConfig.community.defaultReputationIncrement
  ): void => {
    const user = userMap.value.get(userId)
    if (!user) return

    if (user.contributionsDetail) {
      user.contributionsDetail[type] += amount
    }
    user.contributions = (user.contributions || 0) + amount

    updateInArrayMap(users, userMap, userId, { ...user })
  }

  const updateReputation = (userId: string, amount: number): void => {
    const user = userMap.value.get(userId)
    if (!user) return

    user.reputation = (user.reputation || 0) + amount

    updateInArrayMap(users, userMap, userId, { ...user })
  }

  const getUserProfile = (userId: string): UserProfile | null => {
    // O(1) map lookup
    return userMap.value.get(userId) || null
  }

  const setModeratorStatus = (
    userId: string,
    isModerator: boolean
  ): boolean => {
    const user = userMap.value.get(userId)
    if (!user) return false

    user.isModerator = isModerator

    updateInArrayMap(users, userMap, userId, { ...user })

    return true
  }

  const getTopContributors = computed(
    () =>
      (limit: number = limitsConfig.community.defaultTopContributorsLimit) => {
        return [...users.value]
          .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
          .slice(0, limit)
      }
  )

  return {
    // State
    users,
    currentUser,

    // Actions
    setCurrentUser,
    createProfile,
    updateProfile,
    incrementContributions,
    updateReputation,
    getUserProfile,
    setModeratorStatus,

    // Computed
    getTopContributors,
  }
}
