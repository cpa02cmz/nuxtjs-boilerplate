<template>
  <div class="review-queue">
    <div class="queue-header">
      <h2>Review Queue</h2>
      <div class="queue-filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="deprecated">Deprecated</option>
        </select>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search resources..."
          class="search-input"
        />
        <button @click="fetchSubmissions" class="refresh-btn">Refresh</button>
      </div>
    </div>

    <div class="queue-actions">
      <button
        @click="bulkApprove"
        :disabled="!selectedSubmissions.length"
        class="action-btn approve"
      >
        Approve Selected
      </button>
      <button
        @click="bulkReject"
        :disabled="!selectedSubmissions.length"
        class="action-btn reject"
      >
        Reject Selected
      </button>
    </div>

    <div class="queue-list">
      <div
        v-for="submission in filteredSubmissions"
        :key="submission.id"
        class="submission-item"
        :class="{ selected: selectedSubmissions.includes(submission.id) }"
      >
        <div class="item-header">
          <input
            type="checkbox"
            :value="submission.id"
            v-model="selectedSubmissions"
            class="select-checkbox"
          />
          <h3>{{ submission.resourceData.title }}</h3>
          <span class="status-badge" :class="`status-${submission.status}`">
            {{ submission.status }}
          </span>
        </div>
        <div class="item-content">
          <p>{{ submission.resourceData.description }}</p>
          <div class="item-meta">
            <span>Category: {{ submission.resourceData.category }}</span>
            <span>Submitted: {{ formatDate(submission.submittedAt) }}</span>
            <span v-if="submission.resourceData.submittedBy"
              >By: {{ submission.resourceData.submittedBy }}</span
            >
          </div>
          <div class="item-actions">
            <button @click="viewSubmission(submission)" class="action-btn view">
              View
            </button>
            <button
              @click="approveSubmission(submission)"
              class="action-btn approve"
            >
              Approve
            </button>
            <button
              @click="rejectSubmission(submission)"
              class="action-btn reject"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="filteredSubmissions.length === 0" class="no-results">
      No submissions found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Submission } from '~/types/moderation'

const submissions = ref<Submission[]>([])
const loading = ref(true)
const statusFilter = ref('')
const searchQuery = ref('')
const selectedSubmissions = ref<string[]>([])

// Fetch submissions
const fetchSubmissions = async () => {
  loading.value = true
  try {
    // In a real implementation, fetch from API
    // For now, using mock data
    submissions.value = [
      {
        id: 'sub-001',
        resourceData: {
          id: 'res-001',
          title: 'Test Resource 1',
          description: 'This is a test resource for moderation',
          url: 'https://example.com',
          category: 'Development',
          status: 'pending',
          dateAdded: new Date().toISOString(),
          popularity: 5,
        },
        status: 'pending',
        submittedBy: 'user-001',
        submittedAt: new Date().toISOString(),
        notes: 'Needs review for quality',
      },
      {
        id: 'sub-002',
        resourceData: {
          id: 'res-002',
          title: 'Test Resource 2',
          description: 'Another test resource',
          url: 'https://example2.com',
          category: 'Design',
          status: 'pending',
          dateAdded: new Date().toISOString(),
          popularity: 3,
        },
        status: 'pending',
        submittedBy: 'user-002',
        submittedAt: new Date().toISOString(),
      },
    ]
  } catch (error) {
    console.error('Error fetching submissions:', error)
  } finally {
    loading.value = false
  }
}

// Filter submissions based on status and search query
const filteredSubmissions = computed(() => {
  return submissions.value.filter(sub => {
    const matchesStatus =
      !statusFilter.value || sub.status === statusFilter.value
    const matchesSearch =
      !searchQuery.value ||
      sub.resourceData.title
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      sub.resourceData.description
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      sub.resourceData.category
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())

    return matchesStatus && matchesSearch
  })
})

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// View submission details
const viewSubmission = (submission: Submission) => {
  // In a real implementation, navigate to submission details
  console.log('Viewing submission:', submission)
}

// Approve a submission
const approveSubmission = async (submission: Submission) => {
  try {
    // In a real implementation, call API to approve submission
    console.log('Approving submission:', submission)
    // Update local state
    submission.status = 'approved'
  } catch (error) {
    console.error('Error approving submission:', error)
  }
}

// Reject a submission
const rejectSubmission = async (submission: Submission) => {
  try {
    // In a real implementation, call API to reject submission
    console.log('Rejecting submission:', submission)
    // Update local state
    submission.status = 'rejected'
  } catch (error) {
    console.error('Error rejecting submission:', error)
  }
}

// Bulk approve selected submissions
const bulkApprove = async () => {
  console.log('Bulk approving:', selectedSubmissions)
  // In a real implementation, call API to approve multiple submissions
  selectedSubmissions.value.forEach(id => {
    const sub = submissions.value.find(s => s.id === id)
    if (sub) sub.status = 'approved'
  })
  selectedSubmissions.value = []
}

// Bulk reject selected submissions
const bulkReject = async () => {
  console.log('Bulk rejecting:', selectedSubmissions)
  // In a real implementation, call API to reject multiple submissions
  selectedSubmissions.value.forEach(id => {
    const sub = submissions.value.find(s => s.id === id)
    if (sub) sub.status = 'rejected'
  })
  selectedSubmissions.value = []
}

onMounted(() => {
  fetchSubmissions()
})
</script>

<style scoped>
.review-queue {
  margin: 1rem 0;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.queue-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-select,
.search-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-input {
  min-width: 200px;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #0056b3;
}

.queue-actions {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.approve {
  background: #28a745;
  color: white;
}

.approve:hover:not(:disabled) {
  background: #218838;
}

.reject {
  background: #dc3545;
  color: white;
}

.reject:hover:not(:disabled) {
  background: #c82333;
}

.view {
  background: #6c757d;
  color: white;
}

.view:hover {
  background: #5a6268;
}

.queue-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.submission-item {
  border-bottom: 1px solid #eee;
  padding: 1rem;
}

.submission-item:last-child {
  border-bottom: none;
}

.submission-item.selected {
  background-color: #e7f3ff;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.select-checkbox {
  margin-right: 0.5rem;
}

.item-header h3 {
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
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

.status-deprecated {
  background: #d6d8db;
  color: #383d41;
}

.item-content p {
  margin: 0.5rem 0;
  color: #6c757d;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0.5rem 0;
  flex-wrap: wrap;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.loading,
.no-results {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}
</style>
