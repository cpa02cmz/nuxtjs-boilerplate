<template>
  <div class="submission-review">
    <div
      v-if="loading"
      class="loading"
    >
      {{ contentConfig.submissionReview.loading }}
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="submission"
      class="review-content"
    >
      <div class="review-header">
        <h1>{{ submission.resourceData?.title }}</h1>
        <span :class="['status-badge', `status-${submission.status}`]">
          {{ submission.status }}
        </span>
      </div>

      <div class="review-details">
        <div class="detail-section">
          <h3>{{ contentConfig.submissionReview.sections.resourceInfo }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.description
              }}</label>
              <p>{{ submission.resourceData?.description }}</p>
            </div>

            <div class="info-item">
              <label>{{ contentConfig.submissionReview.labels.url }}</label>
              <a
                :href="submission.resourceData?.url"
                target="_blank"
                class="url-link"
              >
                {{ submission.resourceData?.url }}
              </a>
            </div>

            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.category
              }}</label>
              <span>{{ submission.resourceData?.category }}</span>
            </div>

            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.pricingModel
              }}</label>
              <span>{{
                submission.resourceData?.pricingModel ||
                  contentConfig.submissionReview.values.notAvailable
              }}</span>
            </div>

            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.difficulty
              }}</label>
              <span>{{
                submission.resourceData?.difficulty ||
                  contentConfig.submissionReview.values.notAvailable
              }}</span>
            </div>

            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.technologies
              }}</label>
              <div class="tag-list">
                <span
                  v-for="tech in submission.resourceData?.technology || []"
                  :key="tech"
                  class="tag"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <div class="info-item">
              <label>{{ contentConfig.submissionReview.labels.tags }}</label>
              <div class="tag-list">
                <span
                  v-for="tag in submission.resourceData?.tags || []"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.benefits
              }}</label>
              <ul>
                <li
                  v-for="benefit in submission.resourceData?.benefits || []"
                  :key="benefit"
                >
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>
            {{ contentConfig.submissionReview.sections.submissionDetails }}
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.submittedBy
              }}</label>
              <span>{{
                submission.submittedBy ||
                  contentConfig.submissionReview.values.anonymous
              }}</span>
            </div>

            <div class="info-item">
              <label>{{
                contentConfig.submissionReview.labels.submittedAt
              }}</label>
              <span>{{ formatDate(submission.submittedAt) }}</span>
            </div>

            <div
              v-if="submission.reviewedAt"
              class="info-item"
            >
              <label>{{
                contentConfig.submissionReview.labels.reviewedBy
              }}</label>
              <span>{{
                submission.reviewedBy ||
                  contentConfig.submissionReview.values.notAvailable
              }}</span>
            </div>

            <div
              v-if="submission.reviewedAt"
              class="info-item"
            >
              <label>{{
                contentConfig.submissionReview.labels.reviewedAt
              }}</label>
              <span>{{ formatDate(submission.reviewedAt) }}</span>
            </div>

            <div
              v-if="submission.rejectionReason"
              class="info-item"
            >
              <label>{{
                contentConfig.submissionReview.labels.rejectionReason
              }}</label>
              <span class="rejection-reason">{{
                submission.rejectionReason
              }}</span>
            </div>

            <div
              v-if="submission.notes"
              class="info-item"
            >
              <label>{{ contentConfig.submissionReview.labels.notes }}</label>
              <span>{{ submission.notes }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="submission.status === 'pending'"
        class="review-actions"
      >
        <div class="action-group">
          <h4>{{ contentConfig.submissionReview.actions.approve.title }}</h4>
          <button
            class="btn btn-approve"
            @click="handleApprove"
          >
            {{ contentConfig.submissionReview.actions.approve.button }}
          </button>
        </div>

        <div class="action-group">
          <h4>{{ contentConfig.submissionReview.actions.reject.title }}</h4>
          <textarea
            v-model="rejectionReason"
            :placeholder="
              contentConfig.submissionReview.placeholders.rejectionReason
            "
            class="rejection-textarea"
          />
          <button
            class="btn btn-reject"
            @click="handleReject"
          >
            {{ contentConfig.submissionReview.actions.reject.button }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSubmissionReview } from '~/composables/useSubmissionReview'
import { contentConfig } from '~/configs/content.config'

interface Props {
  submissionId?: string
}

const props = withDefaults(defineProps<Props>(), {
  submissionId: '',
})

const {
  loading,
  error,
  submission,
  rejectionReason,
  fetchSubmission,
  approveSubmission,
  rejectSubmission,
} = useSubmissionReview({
  submissionId: props.submissionId,
})

const handleApprove = async () => {
  const success = await approveSubmission()
  if (success) {
    alert(contentConfig.submissionReview.actions.approve.title)
  } else {
    alert(error.value || contentConfig.submissionReview.errors.approveFailed)
  }
}

const handleReject = async () => {
  const success = await rejectSubmission(rejectionReason.value)
  if (success) {
    alert(contentConfig.submissionReview.actions.reject.title)
  } else {
    alert(error.value || contentConfig.submissionReview.errors.rejectFailed)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return contentConfig.submissionReview.values.notAvailable
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchSubmission()
})
</script>

<style scoped>
.submission-review {
  padding: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.review-header h1 {
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
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: bold;
  color: var(--color-text);
  font-size: 0.9rem;
}

.info-item p,
.info-item span,
.info-item ul {
  margin: 0;
  color: var(--color-text-secondary);
  word-break: break-word;
}

.info-item ul {
  padding-left: 1.5rem;
}

.url-link {
  color: var(--color-primary);
  text-decoration: none;
}

.url-link:hover {
  text-decoration: underline;
}

.tag-list {
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

.rejection-reason {
  color: var(--color-error);
  font-weight: 500;
}

.review-actions {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.action-group {
  flex: 1;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.action-group h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.rejection-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-bottom: 1rem;
  resize: vertical;
  background: var(--color-background);
  color: var(--text-color);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  display: inline-block;
}

.btn-approve {
  background: var(--color-success);
  color: white;
}

.btn-reject {
  background: var(--color-error);
  color: white;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
}
</style>
