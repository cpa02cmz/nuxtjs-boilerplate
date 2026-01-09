/**
 * Composable for community features (Orchestrator)
 * Coordinates user profiles, comments, voting, and moderation systems
 *
 * Architecture:
 * - This composable acts as an orchestrator, composing smaller, focused composables
 * - Delegates to domain-specific composables: useUserProfiles, useComments, useVoting, useModeration
 * - Maintains backward compatibility with existing API
 *
 * Performance optimizations:
 * - O(1) lookups using Map-based indexing
 * - Reactive state with Vue 3 Composition API
 * - Eliminated N+1 linear searches
 */
import type { User, Comment, Vote, Flag } from '~/types/resource'
import { useUserProfiles } from './community/useUserProfiles'
import { useComments } from './community/useComments'
import { useVoting } from './community/useVoting'
import { useModeration } from './community/useModeration'

interface CommentData {
  resourceId: string
  content: string
}

interface ReplyData {
  content: string
}

export const useCommunityFeatures = (
  initialUsers: User[] = [],
  initialComments: Comment[] = [],
  initialVotes: Vote[] = [],
  initialFlags: Flag[] = []
) => {
  // Initialize focused composables with callbacks for cross-module communication

  const commentsComposable = useComments(initialComments)

  const userProfilesComposable = useUserProfiles(initialUsers)

  const votingComposable = useVoting(
    initialVotes,
    // Callback to update comment vote counts
    (
      targetType: string,
      targetId: string,
      voteType: 'up' | 'down',
      change: number
    ) => {
      if (targetType === 'comment') {
        commentsComposable.updateCommentVotes(targetId, change)
      }
    },
    // Callback to update user contribution counts
    (userId: string, change: number) => {
      userProfilesComposable.incrementContributions('votes', change)
    }
  )

  const moderationComposable = useModeration(
    initialFlags,
    // Callback to remove comments by moderator
    (commentId: string) => {
      return commentsComposable.removeCommentByModerator(commentId)
    }
  )

  // Helper to bridge type compatibility between old and new interfaces
  const currentUser = userProfilesComposable.currentUser

  // Set current user
  const setCurrentUser = (user: User) => {
    userProfilesComposable.setCurrentUser(user as any)
  }

  // User profile management
  const createProfile = (userData: Partial<User>) => {
    return userProfilesComposable.createProfile(userData as any)
  }

  const updateProfile = (userId: string, updates: Partial<User>) => {
    return userProfilesComposable.updateProfile(userId, updates as any)
  }

  const getUserProfile = (userId: string) => {
    return userProfilesComposable.getUserProfile(userId)
  }

  // Comment system
  const addComment = (commentData: CommentData) => {
    const user = userProfilesComposable.currentUser.value
    if (!user) {
      throw new Error('User must be logged in to comment')
    }

    const comment = commentsComposable.addComment(commentData, user as any)

    // Update user contributions
    userProfilesComposable.incrementContributions('comments', 1)

    return comment
  }

  const addReply = (commentId: string, replyData: ReplyData) => {
    const user = userProfilesComposable.currentUser.value
    if (!user) {
      throw new Error('User must be logged in to reply')
    }

    return commentsComposable.addReply(commentId, replyData, user as any)
  }

  const editComment = (commentId: string, newContent: string) => {
    const user = userProfilesComposable.currentUser.value
    return commentsComposable.editComment(commentId, newContent, user as any)
  }

  const deleteComment = (commentId: string) => {
    const user = userProfilesComposable.currentUser.value
    return commentsComposable.deleteComment(commentId, user as any)
  }

  const getCommentsForResource = (resourceId: string) => {
    return commentsComposable.getCommentsForResource(resourceId)
  }

  // Voting system
  const vote = (
    targetType: string,
    targetId: string,
    voteType: 'up' | 'down'
  ) => {
    const user = userProfilesComposable.currentUser.value
    return votingComposable.vote(targetType, targetId, voteType, user as any)
  }

  // Moderation system
  const flagContent = (
    targetType: string,
    targetId: string,
    reason: string,
    details: string = ''
  ) => {
    const user = userProfilesComposable.currentUser.value
    return moderationComposable.flagContent(
      targetType,
      targetId,
      reason,
      user as any,
      details
    )
  }

  const moderateContent = (
    flagId: string,
    action: string,
    moderatorNote: string = ''
  ) => {
    const user = userProfilesComposable.currentUser.value
    return moderationComposable.moderateContent(
      flagId,
      action,
      user as any,
      moderatorNote
    )
  }

  // Activity and stats
  const getUserActivity = (userId: string) => {
    const userComments = commentsComposable.getUserComments(userId)
    const userVotes = votingComposable.getUserVotes(userId)

    return {
      comments: userComments,
      votes: userVotes,
      totalActivity: userComments.length + userVotes.length,
    }
  }

  const getTopContributors = (limit?: number) => {
    return userProfilesComposable.getTopContributors(limit || 10)
  }

  // Return composable functions (maintaining backward compatibility)
  return {
    // User management
    setCurrentUser,
    createProfile,
    updateProfile,
    getUserProfile,

    // Comment system
    addComment,
    addReply,
    editComment,
    deleteComment,
    getCommentsForResource,

    // Voting system
    vote,

    // Moderation
    flagContent,
    moderateContent,

    // Activity and stats
    getUserActivity,
    getTopContributors,

    // Data access (for backward compatibility)
    users: userProfilesComposable.users,
    comments: commentsComposable.comments,
    votes: votingComposable.votes,
    flags: moderationComposable.flags,
  }
}
