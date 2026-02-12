<template>
  <div class="review-queue">
    <div class="queue-header">
      <h2>{{ contentConfig.reviewQueue.title }}</h2>
      <div class="queue-filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="">
            {{ contentConfig.reviewQueue.filters.allStatuses }}
          </option>
          <option value="pending">
            {{ contentConfig.reviewQueue.filters.pending }}
          </option>
          <option value="approved">
            {{ contentConfig.reviewQueue.filters.approved }}
          </option>
          <option value="rejected">
            {{ contentConfig.reviewQueue.filters.rejected }}
          </option>
        </select>
        <input
          v-model="categoryFilter"
          type="text"
          :placeholder="moderationConfig.ui.categoryFilterPlaceholder"
          class="filter-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      {{ contentConfig.reviewQueue.loading }}
    </div>

    <div v-else-if="filteredSubmissions.length > 0" class="submissions-list">
      <div
        v-for="submission in filteredSubmissions"
        :key="submission.id"
        class="submission-card"
      >
        <div class="submission-header">
          <h3>{{ submission.resourceData?.title }}</h3>
          <span :class="['status-badge', `status-${submission.status}`]">
            {{ submission.status }}
          </span>
        </div>

        <div class="submission-details">
          <p class="description">
            {{ submission.resourceData?.description }}
          </p>
          <div class="meta-info">
            <span class="category"
              >{{ contentConfig.reviewQueue.labels.category }}
              {{ submission.resourceData?.category }}</span
            >
            <span class="submitted-by"
              >{{ contentConfig.reviewQueue.labels.submittedBy }}
              {{ submission.submittedBy }}</span
            >
            <span class="submitted-at"
              >{{ contentConfig.reviewQueue.labels.submittedAt }}
              {{ formatDate(submission.submittedAt) }}</span
            >
          </div>

          <div class="tags">
            <span
              v-for="tag in submission.resourceData?.tags || []"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="submission-actions">
          <NuxtLink
            :to="`/moderation/review/${submission.id}`"
            class="btn btn-primary"
          >
            {{ contentConfig.reviewQueue.actions.review }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      {{ contentConfig.reviewQueue.emptyState }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReviewQueue } from '~/composables/useReviewQueue'
import type { Submission } from '~/types/submission'
import { moderationConfig } from '~/configs/moderation.config'
import { contentConfig } from '~/configs/content.config'
import { shadowsConfig } from '~/configs/shadows.config'

interface Props {
  initialSubmissions?: Submission[]
}

const props = withDefaults(defineProps<Props>(), {
  initialSubmissions: () => [],
})

const {
  loading,
  error: _error,
  statusFilter,
  categoryFilter,
  filteredSubmissions,
  formatDate,
} = useReviewQueue(props.initialSubmissions)
</script>

<style scoped>
.review-queue {
  padding: 1rem;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.queue-header h2 {
  margin: 0;
  color: var(--color-text);
}

.queue-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.submission-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--color-card-background);
  box-shadow: v-bind('shadowsConfig.reviewQueue.cardShadow');
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.submission-header h3 {
  margin: 0;
  color: var(--color-text);
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-pending {
  background: v-bind('moderationConfig.statusColors.pending.bg');
  color: v-bind('moderationConfig.statusColors.pending.text');
}

.status-approved {
  background: v-bind('moderationConfig.statusColors.approved.bg');
  color: v-bind('moderationConfig.statusColors.approved.text');
}

.status-rejected {
  background: v-bind('moderationConfig.statusColors.rejected.bg');
  color: v-bind('moderationConfig.statusColors.rejected.text');
}

.submission-details {
  margin-bottom: 1rem;
}

.description {
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.meta-info span {
  display: flex;
  align-items: center;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: var(--color-tag-background);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
}
</style>
