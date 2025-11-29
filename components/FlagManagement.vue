<template>
  <div class="flag-management">
    <h3>Flag Management</h3>

    <div class="flag-form">
      <h4>Report Resource</h4>
      <select v-model="flagReason" class="reason-select">
        <option value="">Select reason for flagging</option>
        <option value="spam">Spam</option>
        <option value="inappropriate">Inappropriate Content</option>
        <option value="broken-link">Broken Link</option>
        <option value="duplicate">Duplicate Resource</option>
        <option value="other">Other</option>
      </select>

      <textarea
        v-if="flagReason === 'other'"
        v-model="customReason"
        placeholder="Please describe the issue..."
        class="custom-reason"
      ></textarea>

      <button @click="submitFlag" :disabled="!canSubmit" class="submit-btn">
        Submit Flag
      </button>
    </div>

    <div v-if="flags.length > 0" class="flags-list">
      <h4>Current Flags</h4>
      <div v-for="flag in flags" :key="flag.id" class="flag-item">
        <div class="flag-header">
          <span class="flag-reason">{{ flag.reason }}</span>
          <span class="flag-date">{{ formatDate(flag.createdAt) }}</span>
          <button
            @click="resolveFlag(flag.id)"
            :disabled="flag.resolved"
            class="resolve-btn"
          >
            {{ flag.resolved ? 'Resolved' : 'Mark Resolved' }}
          </button>
        </div>
        <div v-if="flag.reportedBy" class="flag-reported-by">
          Reported by: {{ flag.reportedBy }}
        </div>
      </div>
    </div>

    <div v-else class="no-flags">No flags for this resource</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Flag } from '~/types/resource'

const props = defineProps<{
  resourceId: string
}>()

const flagReason = ref('')
const customReason = ref('')
const flags = ref<Flag[]>([])

// Mock initial flags for the resource
flags.value = [
  {
    id: 'flag-001',
    resourceId: props.resourceId,
    reason: 'broken-link',
    reportedBy: 'user-001',
    createdAt: new Date().toISOString(),
    resolved: false,
  },
]

const canSubmit = computed(() => {
  return (
    flagReason.value &&
    (flagReason.value !== 'other' || customReason.value.trim())
  )
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const submitFlag = async () => {
  if (!canSubmit.value) return

  const reason =
    flagReason.value === 'other' ? customReason.value : flagReason.value

  try {
    // In a real implementation, call API to submit flag
    console.log('Submitting flag:', { resourceId: props.resourceId, reason })

    // Add the new flag to the list
    const newFlag: Flag = {
      id: `flag-${Date.now()}`,
      resourceId: props.resourceId,
      reason,
      reportedBy: 'current-user', // In real app, this would be the actual user
      createdAt: new Date().toISOString(),
      resolved: false,
    }

    flags.value.unshift(newFlag)

    // Reset form
    flagReason.value = ''
    customReason.value = ''
  } catch (error) {
    console.error('Error submitting flag:', error)
  }
}

const resolveFlag = async (flagId: string) => {
  try {
    // In a real implementation, call API to resolve flag
    console.log('Resolving flag:', flagId)

    // Update the flag in the local list by replacing the entire flag object
    flags.value = flags.value.map(f =>
      f.id === flagId ? { ...f, resolved: true } : f
    )
  } catch (error) {
    console.error('Error resolving flag:', error)
  }
}
</script>

<style scoped>
.flag-management {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.flag-form {
  margin-bottom: 1.5rem;
}

.flag-form h4 {
  margin-bottom: 0.5rem;
}

.reason-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.custom-reason {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  resize: vertical;
  min-height: 80px;
}

.submit-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background: #0056b3;
}

.flags-list h4 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.flag-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.flag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.flag-reason {
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
}

.flag-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.resolve-btn {
  padding: 0.25rem 0.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.resolve-btn:hover {
  background: #5a6268;
}

.resolve-btn:disabled {
  background: #28a745;
  cursor: default;
}

.flag-reported-by {
  color: #6c757d;
  font-size: 0.9rem;
}

.no-flags {
  text-align: center;
  padding: 1rem;
  color: #6c757d;
}
</style>
