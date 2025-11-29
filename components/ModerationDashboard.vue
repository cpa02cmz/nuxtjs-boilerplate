<template>
  <div class="moderation-dashboard">
    <h1>Moderation Dashboard</h1>

    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>{{ pendingCount }}</h3>
        <p>Pending Reviews</p>
      </div>
      <div class="stat-card">
        <h3>{{ approvedCount }}</h3>
        <p>Approved This Week</p>
      </div>
      <div class="stat-card">
        <h3>{{ flaggedCount }}</h3>
        <p>Flagged Resources</p>
      </div>
    </div>

    <div class="dashboard-content">
      <ReviewQueue />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Submission } from '~/types/moderation'

const pendingCount = ref(0)
const approvedCount = ref(0)
const flaggedCount = ref(0)

onMounted(async () => {
  // In a real implementation, fetch stats from API
  // For now, using mock data
  pendingCount.value = 12
  approvedCount.value = 24
  flaggedCount.value = 5
})
</script>

<style scoped>
.moderation-dashboard {
  padding: 2rem;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 2rem;
  margin: 0;
  color: #007bff;
}

.stat-card p {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
}

.dashboard-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
