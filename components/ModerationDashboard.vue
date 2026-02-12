<template>
  <div class="moderation-dashboard">
    <header class="dashboard-header">
      <h1>{{ config.dashboard.title }}</h1>
      <p>{{ config.dashboard.subtitle }}</p>
    </header>

    <section aria-label="Dashboard statistics" class="dashboard-stats">
      <article class="stat-card">
        <h2>{{ config.stats.pendingTitle }}</h2>
        <div class="stat-value" :aria-label="`Number of pending reviews`">
          {{ pendingCount }}
        </div>
        <NuxtLink to="/moderation/queue" class="stat-link">
          {{ config.stats.viewQueue }}
        </NuxtLink>
      </article>

      <article class="stat-card">
        <h2>{{ config.stats.approvedTitle }}</h2>
        <div
          class="stat-value"
          :aria-label="`Number of approved resources this week`"
        >
          {{ approvedCount }}
        </div>
        <div class="stat-trend up" aria-label="12 percent increase">+12%</div>
      </article>

      <article class="stat-card">
        <h2>{{ config.stats.rejectedTitle }}</h2>
        <div
          class="stat-value"
          :aria-label="`Number of rejected resources this week`"
        >
          {{ rejectedCount }}
        </div>
        <div class="stat-trend down" aria-label="5 percent decrease">-5%</div>
      </article>

      <article class="stat-card">
        <h2>{{ config.stats.flaggedTitle }}</h2>
        <div class="stat-value" :aria-label="`Number of flagged resources`">
          {{ flaggedCount }}
        </div>
        <NuxtLink to="/moderation/flags" class="stat-link">
          {{ config.stats.viewFlags }}
        </NuxtLink>
      </article>
    </section>

    <div class="dashboard-content">
      <section
        class="recent-activity"
        aria-labelledby="recent-activity-heading"
      >
        <h2 id="recent-activity-heading">
          {{ config.dashboard.recentActivity }}
        </h2>
        <ul class="activity-list" role="list">
          <li
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
          >
            <div
              class="activity-icon"
              :class="`activity-${activity.type}`"
              aria-hidden="true"
            >
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <time class="activity-time" :datetime="activity.timestamp">{{
                formatDate(activity.timestamp)
              }}</time>
            </div>
          </li>
        </ul>
      </section>

      <section class="quick-actions" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading">
          {{ config.dashboard.quickActions }}
        </h2>
        <nav class="action-buttons" aria-label="Quick actions navigation">
          <NuxtLink
            to="/moderation/queue"
            class="action-btn"
            aria-label="Go to review queue"
          >
            <span class="action-icon" aria-hidden="true">📋</span>
            <span>{{ config.actions.reviewQueue }}</span>
          </NuxtLink>

          <NuxtLink
            to="/moderation/flags"
            class="action-btn"
            aria-label="View flagged content"
          >
            <span class="action-icon" aria-hidden="true">🚩</span>
            <span>{{ config.actions.flaggedContent }}</span>
          </NuxtLink>

          <NuxtLink
            to="/moderation/submissions"
            class="action-btn"
            aria-label="View submissions"
          >
            <span class="action-icon" aria-hidden="true">📝</span>
            <span>{{ config.actions.submissions }}</span>
          </NuxtLink>

          <NuxtLink
            to="/moderation/settings"
            class="action-btn"
            aria-label="Go to settings"
          >
            <span class="action-icon" aria-hidden="true">⚙️</span>
            <span>{{ config.actions.settings }}</span>
          </NuxtLink>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModerationDashboard } from '~/composables/useModerationDashboard'
import { contentConfig } from '~/configs/content.config'
import { shadowsConfig } from '~/configs/shadows.config'

const {
  pendingCount,
  approvedCount,
  rejectedCount,
  flaggedCount,
  recentActivity,
  getActivityIcon,
  formatDate,
} = useModerationDashboard()

const config = contentConfig.moderation
</script>

<style scoped>
.moderation-dashboard {
  padding: 1rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.dashboard-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.stat-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.stat-link:hover {
  text-decoration: underline;
}

.stat-trend {
  font-size: 0.9rem;
  font-weight: bold;
}

.stat-trend.up {
  color: var(--color-success);
}

.stat-trend.down {
  color: var(--color-error);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.recent-activity h2,
.quick-actions h2 {
  margin-top: 0;
  color: var(--color-text);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-approve {
  background: v-bind('shadowsConfig.moderationDashboard.approvedBg');
  color: var(--color-success);
}

.activity-reject {
  background: v-bind('shadowsConfig.moderationDashboard.rejectedBg');
  color: var(--color-error);
}

.activity-flag {
  background: v-bind('shadowsConfig.moderationDashboard.flaggedBg');
  color: #ffc107;
}

.activity-submit {
  background: v-bind('shadowsConfig.moderationDashboard.pendingBg');
  color: var(--color-primary);
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 0.25rem 0;
  color: var(--color-text);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-hover);
  transform: translateY(-2px);
  box-shadow: v-bind('shadowsConfig.moderationDashboard.cardShadow');
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
