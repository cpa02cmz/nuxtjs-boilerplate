<template>
  <div class="mt-12">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ contentConfig.comments.title }}
      </h2>
      <span class="text-sm text-gray-500">{{ commentCount }} {{ contentConfig.comments.countLabel }}</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <textarea
        v-model="newComment"
        :placeholder="contentConfig.comments.placeholders.newComment"
        class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="4"
        :aria-label="contentConfig.comments.aria.addComment"
      />
      <div class="mt-3 flex justify-end">
        <button
          class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          @click="submitComment"
        >
          {{ contentConfig.comments.buttons.post }}
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="comment in formattedComments"
        :key="comment.id"
        class="flex space-x-4"
      >
        <div class="flex-shrink-0">
          <div
            class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"
            aria-hidden="true"
          />
        </div>
        <div class="flex-1">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center">
              <span class="font-medium text-gray-900">{{
                comment.displayName
              }}</span>
              <span class="ml-2 text-sm text-gray-500">{{
                comment.displayTime
              }}</span>
            </div>
            <p class="mt-1 text-gray-700">
              {{ comment.displayContent }}
            </p>
            <div class="mt-2 flex space-x-4">
              <button
                class="text-sm text-gray-500 hover:text-gray-700"
                :aria-label="contentConfig.comments.aria.likeComment"
              >
                {{ contentConfig.comments.buttons.like }} ({{
                  comment.displayLikes
                }})
              </button>
              <button
                class="text-sm text-gray-500 hover:text-gray-700"
                :aria-label="contentConfig.comments.aria.replyComment"
              >
                {{ contentConfig.comments.buttons.reply }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Comment } from '~/types/community'
import { TIME } from '~/server/utils/constants'
import { contentConfig } from '~/configs/content.config'

interface Props {
  comments: Comment[]
  commentCount: number
}

const props = defineProps<Props>()

const newComment = ref('')

const emit = defineEmits<{
  submit: [comment: string]
}>()

const submitComment = () => {
  if (newComment.value.trim()) {
    emit('submit', newComment.value.trim())
    newComment.value = ''
  }
}

const formattedComments = computed(() => {
  return props.comments.map(comment => ({
    ...comment,
    displayName: comment.userName || comment.userId,
    displayContent: comment.content,
    displayTime: formatTimeAgo(comment.timestamp),
    displayLikes: comment.votes,
  }))
})

const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / TIME.MS_PER_SECOND
  )

  if (seconds < TIME.SECONDS_PER_MINUTE) return 'just now'
  if (seconds < TIME.SECONDS_PER_HOUR)
    return `${Math.floor(seconds / TIME.SECONDS_PER_MINUTE)} minutes ago`
  if (seconds < TIME.SECONDS_PER_DAY)
    return `${Math.floor(seconds / TIME.SECONDS_PER_HOUR)} hours ago`
  if (seconds < TIME.SECONDS_PER_WEEK)
    return `${Math.floor(seconds / TIME.SECONDS_PER_DAY)} days ago`
  return date.toLocaleDateString()
}
</script>
