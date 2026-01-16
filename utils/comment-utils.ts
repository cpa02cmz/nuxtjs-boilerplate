/**
 * Comment utilities
 * Provides helper functions for comment management operations
 */
import type { Comment } from '~/types/community'

/**
 * Recursively updates a comment in a nested comment array
 * Used to update both top-level comments and nested replies
 *
 * @param commentArray - Array of comments to search
 * @param targetId - ID of the comment to update
 * @param updated - Updated comment object
 * @returns true if comment was found and updated, false otherwise
 *
 * @example
 * ```typescript
 * const updatedComment = { ...comment, content: 'New content' }
 * updateInArray(comments.value, commentId, updatedComment)
 * ```
 */
export const updateInArray = (
  commentArray: Comment[],
  targetId: string,
  updated: Comment
): boolean => {
  for (let i = 0; i < commentArray.length; i++) {
    if (commentArray[i].id === targetId) {
      commentArray[i] = updated
      return true
    }
    if (commentArray[i].replies.length > 0) {
      if (updateInArray(commentArray[i].replies, targetId, updated)) {
        commentArray[i] = { ...commentArray[i] }
        return true
      }
    }
  }
  return false
}
