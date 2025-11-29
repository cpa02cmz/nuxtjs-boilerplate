<template>
  <div class="quality-checks">
    <h3>Quality Checks</h3>

    <div v-if="loading" class="loading">Running quality checks...</div>

    <div v-else-if="result" class="checks-result">
      <div
        class="result-summary"
        :class="{ valid: result.isValid, invalid: !result.isValid }"
      >
        <span class="result-icon">{{ result.isValid ? '✓' : '✗' }}</span>
        <div class="result-info">
          <h4>
            {{
              result.isValid ? 'Quality Check Passed' : 'Quality Issues Found'
            }}
          </h4>
          <p>Score: {{ result.score }}/100</p>
        </div>
      </div>

      <div v-if="result.issues.length > 0" class="issues-list">
        <h4>Issues Found:</h4>
        <ul>
          <li
            v-for="(issue, index) in result.issues"
            :key="index"
            class="issue-item"
          >
            {{ issue }}
          </li>
        </ul>
      </div>

      <div v-if="result.recommendations.length > 0" class="recommendations">
        <h4>Recommendations:</h4>
        <ul>
          <li
            v-for="(rec, index) in result.recommendations"
            :key="index"
            class="recommendation-item"
          >
            {{ rec }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { QualityCheckResult } from '~/types/moderation'
import type { Resource } from '~/types/resource'
import { performQualityCheck } from '~/utils/moderation'

const props = defineProps<{
  resource: Partial<Resource>
}>()

const result = ref<QualityCheckResult | null>(null)
const loading = ref(false)

// Run quality checks when resource prop changes
watch(
  () => props.resource,
  async newResource => {
    if (newResource) {
      loading.value = true
      try {
        result.value = performQualityCheck(newResource)
      } catch (error) {
        console.error('Error running quality checks:', error)
        result.value = {
          isValid: false,
          issues: ['An error occurred while running quality checks'],
          score: 0,
          recommendations: [],
        }
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.quality-checks {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: #6c757d;
}

.result-summary {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 6px;
}

.result-summary.valid {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.result-summary.invalid {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.result-icon {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1rem;
}

.result-summary.valid .result-icon {
  color: #28a745;
}

.result-summary.invalid .result-icon {
  color: #dc3545;
}

.result-info h4 {
  margin: 0 0 0.25rem 0;
}

.result-info p {
  margin: 0;
  font-size: 0.9rem;
}

.issues-list,
.recommendations {
  margin-top: 1rem;
}

.issues-list h4,
.recommendations h4 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.issues-list ul,
.recommendations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.issue-item,
.recommendation-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
}

.issue-item {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.recommendation-item {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.issue-item:last-child,
.recommendation-item:last-child {
  margin-bottom: 0;
}
</style>
