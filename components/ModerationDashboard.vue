<template>
  <div
    class="moderation-dashboard"
    :class="{ 'animations-enabled': !prefersReducedMotion }"
  >
    <header class="dashboard-header">
      <h1>{{ config.dashboard.title }}</h1>
      <p>{{ config.dashboard.subtitle }}</p>
    </header>

    <!-- Palette's micro-UX enhancement: Stat Cards with Counter Animation -->
    <section
      aria-label="Dashboard statistics"
      class="dashboard-stats"
    >
      <article
        v-for="(stat, index) in stats"
        :key="stat.key"
        class="stat-card"
        :class="{
          'is-hovered': hoveredCard === stat.key,
          'is-pressed': pressedCard === stat.key,
        }"
        :style="getCardStyle(index)"
        @mouseenter="handleCardHover(stat.key)"
        @mouseleave="handleCardLeave"
        @mousedown="handleCardPress(stat.key)"
        @mouseup="handleCardRelease"
        @touchstart="handleCardPress(stat.key)"
        @touchend="handleCardRelease"
      >
        <h2>{{ stat.title }}</h2>
        <div
          class="stat-value"
          :class="{ 'is-counting': isCounting }"
          :aria-label="`Number of ${stat.key}`"
        >
          {{ getAnimatedValue(stat.key) }}
        </div>

        <!-- Palette's micro-UX enhancement: Trend indicators with pulse animation -->
        <div
          v-if="stat.trend"
          class="stat-trend"
          :class="[
            stat.trend.direction,
            { 'is-pulsing': !prefersReducedMotion && stat.trend.value !== 0 },
          ]"
          :aria-label="`${stat.trend.value} percent ${stat.trend.direction}`"
        >
          <span class="trend-icon">
            {{ stat.trend.direction === 'up' ? '↗' : '↘' }}
          </span>
          {{ stat.trend.value }}%
        </div>

        <!-- Palette's micro-UX enhancement: Action link with hover effect -->
        <NuxtLink
          v-if="stat.link"
          :to="stat.link"
          class="stat-link"
          @click="handleLinkClick"
        >
          <span>{{ stat.linkText }}</span>
          <svg
            class="stat-link-arrow"
            :class="{ 'is-hovered': hoveredCard === stat.key }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </article>
    </section>

    <div class="dashboard-content">
      <!-- Palette's micro-UX enhancement: Recent Activity with Staggered Animation -->
      <section
        class="recent-activity"
        aria-labelledby="recent-activity-heading"
      >
        <h2 id="recent-activity-heading">
          {{ config.dashboard.recentActivity }}
        </h2>
        <TransitionGroup
          name="activity-list"
          tag="ul"
          class="activity-list"
          role="list"
          :class="{ 'animations-enabled': !prefersReducedMotion }"
        >
          <li
            v-for="(activity, index) in recentActivity"
            :key="activity.id"
            class="activity-item"
            :class="{
              'is-hovered': hoveredActivity === activity.id,
            }"
            :style="getActivityStyle(index)"
            @mouseenter="handleActivityHover(activity.id)"
            @mouseleave="handleActivityLeave"
          >
            <!-- Palette's micro-UX enhancement: Activity icon with bounce animation -->
            <div
              class="activity-icon"
              :class="`activity-${activity.type}`"
              :aria-hidden="true"
            >
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <p>{{ activity.message }}</p>
              <time
                class="activity-time"
                :datetime="activity.timestamp"
              >{{
                formatDate(activity.timestamp)
              }}</time>
            </div>

            <!-- Palette's micro-UX enhancement: Hover indicator -->
            <div
              v-if="hoveredActivity === activity.id"
              class="activity-hover-indicator"
              aria-hidden="true"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </li>
        </TransitionGroup>

        <!-- Empty state with animation -->
        <Transition
          :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slow} ease-out`"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="recentActivity.length === 0"
            class="activity-empty-state"
          >
            <div
              class="activity-empty-icon"
              :class="{ 'animate-float': !prefersReducedMotion }"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="activity-empty-text">
              {{ contentConfig.moderation.activity.emptyState }}
            </p>
          </div>
        </Transition>
      </section>

      <!-- Palette's micro-UX enhancement: Quick Actions with Press Effects -->
      <section
        class="quick-actions"
        aria-labelledby="quick-actions-heading"
      >
        <h2 id="quick-actions-heading">
          {{ config.dashboard.quickActions }}
        </h2>
        <nav
          class="action-buttons"
          aria-label="Quick actions navigation"
        >
          <NuxtLink
            v-for="(action, index) in quickActions"
            :key="action.route"
            :to="action.route"
            class="action-btn"
            :class="{
              'is-hovered': hoveredAction === action.route,
              'is-pressed': pressedAction === action.route,
            }"
            :aria-label="action.ariaLabel"
            :style="getActionStyle(index)"
            @mouseenter="handleActionHover(action.route)"
            @mouseleave="handleActionLeave"
            @mousedown="handleActionPress(action.route)"
            @mouseup="handleActionRelease"
            @touchstart="handleActionPress(action.route)"
            @touchend="handleActionRelease"
            @click="handleActionClick"
          >
            <!-- Palette's micro-UX enhancement: Action icon with subtle bounce -->
            <span
              class="action-icon"
              :class="{ 'is-hovered': hoveredAction === action.route }"
              aria-hidden="true"
            >
              {{ action.icon }}
            </span>
            <span class="action-text">{{ action.label }}</span>

            <!-- Palette's micro-UX enhancement: Arrow indicator -->
            <svg
              class="action-arrow"
              :class="{ 'is-visible': hoveredAction === action.route }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </nav>
      </section>
    </div>

    <!-- Palette's micro-UX enhancement: Screen reader announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useModerationDashboard } from '~/composables/useModerationDashboard'
import { contentConfig } from '~/configs/content.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { uiConfig } from '~/configs/ui.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

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

// Palette's micro-UX enhancement: Reduced motion preference
const prefersReducedMotion = ref(false)
const isCounting = ref(false)

// Animated counter values
const animatedValues = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  flagged: 0,
})

// Target values for counting animation
const targetValues = computed(() => ({
  pending: pendingCount.value,
  approved: approvedCount.value,
  rejected: rejectedCount.value,
  flagged: flaggedCount.value,
}))

// Palette's micro-UX enhancement: Hover and press state tracking
const hoveredCard = ref<string | null>(null)
const pressedCard = ref<string | null>(null)
const hoveredActivity = ref<string | null>(null)
const hoveredAction = ref<string | null>(null)
const pressedAction = ref<string | null>(null)
const announcement = ref('')

// Stat card configuration
const stats = computed(() => [
  {
    key: 'pending',
    title: config.stats.pendingTitle,
    value: pendingCount.value,
    link: '/moderation/queue',
    linkText: config.stats.viewQueue,
  },
  {
    key: 'approved',
    title: config.stats.approvedTitle,
    value: approvedCount.value,
    trend: { direction: 'up' as const, value: 12 },
  },
  {
    key: 'rejected',
    title: config.stats.rejectedTitle,
    value: rejectedCount.value,
    trend: { direction: 'down' as const, value: 5 },
  },
  {
    key: 'flagged',
    title: config.stats.flaggedTitle,
    value: flaggedCount.value,
    link: '/moderation/flags',
    linkText: config.stats.viewFlags,
  },
])

// Quick actions configuration
const quickActions = computed(() => [
  {
    route: '/moderation/queue',
    label: config.actions.reviewQueue,
    icon: '📋',
    ariaLabel: 'Go to review queue',
  },
  {
    route: '/moderation/flags',
    label: config.actions.flaggedContent,
    icon: '🚩',
    ariaLabel: 'View flagged content',
  },
  {
    route: '/moderation/submissions',
    label: config.actions.submissions,
    icon: '📝',
    ariaLabel: 'View submissions',
  },
  {
    route: '/moderation/settings',
    label: config.actions.settings,
    icon: '⚙️',
    ariaLabel: 'Go to settings',
  },
])

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Helper to get animated value with proper typing
const getAnimatedValue = (key: string): number => {
  return animatedValues.value[key as keyof typeof animatedValues.value] ?? 0
}

// Palette's micro-UX enhancement: Counter animation with easeOutExpo
const animateCounter = (
  key: string,
  target: number,
  // Flexy hates hardcoded 1500! Using animationConfig.analyticsCounter.durationMs
  duration: number = animationConfig.analyticsCounter.durationMs
) => {
  const start = animatedValues.value[key as keyof typeof animatedValues.value]
  const startTime = performance.now()

  const easeOutExpo = (t: number) => {
    // Flexy hates hardcoded 2 and 10!
    return t === 1
      ? 1
      : 1 -
          Math.pow(
            easingConfig.powers.easeOutExpoBase,
            -easingConfig.powers.easeOutExpoMultiplier * t
          )
  }

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutExpo(progress)

    const current = Math.round(start + (target - start) * easedProgress)
    animatedValues.value[key as keyof typeof animatedValues.value] = current

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    }
  }

  requestAnimationFrame(updateCounter)
}

// Start counter animations
const startCounterAnimations = () => {
  if (prefersReducedMotion.value) {
    // Skip animation, set values directly
    animatedValues.value = { ...targetValues.value }
    return
  }

  isCounting.value = true

  // Stagger counter animations
  Object.keys(targetValues.value).forEach((key, index) => {
    setTimeout(() => {
      animateCounter(
        key,
        targetValues.value[key as keyof typeof targetValues.value]
      )
    }, index * animationConfig.moderationDashboard.cardStaggerDelayMs)
  })

  // Announce completion after all animations
  setTimeout(() => {
    isCounting.value = false
    announcement.value = `Dashboard loaded. ${targetValues.value.pending} pending, ${targetValues.value.approved} approved.`
    setTimeout(() => {
      announcement.value = ''
    }, animationConfig.moderationDashboard.announcementDisplayDurationMs)

    // Haptic feedback for completion
    hapticSuccess()
  }, animationConfig.moderationDashboard.counterAnimationDurationMs)
}

// Palette's micro-UX enhancement: Card hover handlers
const handleCardHover = (key: string) => {
  hoveredCard.value = key
}

const handleCardLeave = () => {
  hoveredCard.value = null
  pressedCard.value = null
}

const handleCardPress = (key: string) => {
  if (prefersReducedMotion.value) return
  pressedCard.value = key
}

const handleCardRelease = () => {
  pressedCard.value = null
}

// Palette's micro-UX enhancement: Activity hover handlers
const handleActivityHover = (id: string) => {
  hoveredActivity.value = id
}

const handleActivityLeave = () => {
  hoveredActivity.value = null
}

// Palette's micro-UX enhancement: Action button handlers
const handleActionHover = (route: string) => {
  hoveredAction.value = route
}

const handleActionLeave = () => {
  hoveredAction.value = null
  pressedAction.value = null
}

const handleActionPress = (route: string) => {
  if (prefersReducedMotion.value) return
  pressedAction.value = route
}

const handleActionRelease = () => {
  pressedAction.value = null
}

const handleActionClick = () => {
  hapticLight()
}

const handleLinkClick = () => {
  hapticLight()
}

// Get card style with staggered delay
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    '--card-index': index,
    '--stagger-delay': `${index * animationConfig.moderationDashboard?.cardStaggerDelayMs || 100}ms`,
  }
}

// Get activity style with staggered delay
const getActivityStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const delay = Math.min(
    index * (animationConfig.moderationDashboard?.activityStaggerDelayMs || 75),
    animationConfig.moderationDashboard?.maxActivityStaggerDelayMs || 600
  )

  return {
    '--activity-index': index,
    '--activity-delay': `${delay}ms`,
  }
}

// Get action style with staggered delay
const getActionStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    '--action-index': index,
    '--action-delay': `${index * (animationConfig.moderationDashboard?.actionStaggerDelayMs || 100)}ms`,
  }
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Initialize on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)
  }

  // Start counter animations after a brief delay
  setTimeout(
    startCounterAnimations,
    animationConfig.moderationDashboard.counterStartDelayMs
  )
})

// Cleanup on unmount
onUnmounted(() => {
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
})

// Watch for value changes and update animations
watch(
  targetValues,
  newValues => {
    if (!isCounting.value && !prefersReducedMotion.value) {
      Object.keys(newValues).forEach(key => {
        const newValue = newValues[key as keyof typeof newValues]
        const currentValue =
          animatedValues.value[key as keyof typeof animatedValues.value]
        if (newValue !== currentValue) {
          animateCounter(
            key,
            newValue,
            animationConfig.moderationDashboard.counterUpdateDurationMs
          )
        }
      })
    }
  },
  { deep: true }
)
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

/* Palette's micro-UX enhancement: Enhanced Stat Cards */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
  padding: 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all v-bind('animationConfig.cssTransitions.normalSec')
    v-bind('animationConfig.easing.spring');
  cursor: pointer;
  /* Palette's micro-UX enhancement: Entrance animation */
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  animation: card-entrance
    v-bind(
      'animationConfig.moderationDashboard?.cardEntranceDurationSec || "0.5s"'
    )
    v-bind('animationConfig.easing.spring') forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes card-entrance {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Palette's micro-UX enhancement: Card hover effects */
.stat-card:hover,
.stat-card.is-hovered {
  transform: translateY(-6px) scale(1.02);
  box-shadow: v-bind(
    'shadowsConfig.moderationDashboard?.cardHoverShadow || "0 12px 24px rgba(0, 0, 0, 0.1)"'
  );
  border-color: v-bind(
    'componentColorsConfig.moderationDashboard?.cardHoverBorder || "rgba(59, 130, 246, 0.3)"'
  );
}

/* Palette's micro-UX enhancement: Card press effect */
.stat-card.is-pressed {
  transform: scale(0.98) !important;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Palette's micro-UX enhancement: Animated stat value */
.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  line-height: 1;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.stat-value.is-counting {
  color: v-bind(
    'componentColorsConfig.moderationDashboard?.countingColor || "#3b82f6"'
  );
}

/* Palette's micro-UX enhancement: Trend indicators with pulse */
.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.stat-trend.up {
  background: v-bind(
    'componentColorsConfig.moderationDashboard?.trendUpBg || "rgba(34, 197, 94, 0.1)"'
  );
  color: var(--color-success);
}

.stat-trend.down {
  background: v-bind(
    'componentColorsConfig.moderationDashboard?.trendDownBg || "rgba(239, 68, 68, 0.1)"'
  );
  color: var(--color-error);
}

/* Palette's micro-UX enhancement: Trend pulse animation */
.stat-trend.is-pulsing {
  animation: trend-pulse
    v-bind('animationConfig.moderationDashboard?.trendPulseDurationSec || "2s"')
    ease-in-out infinite;
}

@keyframes trend-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    box-shadow: 0 0 0 4px transparent;
  }
}

.trend-icon {
  font-size: 1.1em;
}

/* Palette's micro-UX enhancement: Enhanced stat link */
.stat-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.stat-link:hover {
  color: v-bind(
    'componentColorsConfig.moderationDashboard?.linkHoverColor || "#2563eb"'
  );
  gap: 0.5rem;
}

.stat-link-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.stat-link-arrow.is-hovered {
  transform: translateX(4px);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.recent-activity h2,
.quick-actions h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
}

/* Palette's micro-UX enhancement: Activity list with staggered animation */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
  position: relative;
  overflow: hidden;
  /* Palette's micro-UX enhancement: Entrance animation */
  opacity: 0;
  transform: translateX(-20px);
  animation: activity-entrance
    v-bind(
      'animationConfig.moderationDashboard?.activityEntranceDurationSec || "0.4s"'
    )
    ease-out forwards;
  animation-delay: calc(
    var(--activity-delay, 0ms) +
      v-bind(
        '(animationConfig.moderationDashboard?.activityDelayOffsetMs || 400) + "ms"'
      )
  );
}

@keyframes activity-entrance {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.activity-item:hover,
.activity-item.is-hovered {
  background: var(--color-hover);
  transform: translateX(4px);
  box-shadow: v-bind(
    'shadowsConfig.moderationDashboard?.activityHoverShadow || "0 4px 12px rgba(0, 0, 0, 0.05)"'
  );
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
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.activity-item:hover .activity-icon {
  transform: scale(1.1);
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
  color: v-bind('componentColorsConfig.moderationDashboard.activity.flag');
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

/* Palette's micro-UX enhancement: Activity hover indicator */
.activity-hover-indicator {
  display: flex;
  align-items: center;
  color: var(--color-text-tertiary);
  animation: fade-in v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Palette's micro-UX enhancement: Activity empty state */
.activity-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  background: linear-gradient(
    135deg,
    v-bind(
        'componentColorsConfig.moderationDashboard?.emptyStateBgStart || "#f9fafb"'
      )
      0%,
    v-bind(
        'componentColorsConfig.moderationDashboard?.emptyStateBgEnd || "#f3f4f6"'
      )
      100%
  );
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
  border: 2px dashed
    v-bind(
      'componentColorsConfig.moderationDashboard?.emptyStateBorder || "#e5e7eb"'
    );
}

.activity-empty-icon {
  width: 48px;
  height: 48px;
  color: v-bind(
    'componentColorsConfig.moderationDashboard?.emptyStateIconColor || "#9ca3af"'
  );
  margin-bottom: 1rem;
}

.activity-empty-icon.animate-float {
  animation: float
    v-bind('animationConfig.moderationDashboard?.floatDurationSec || "3s"')
    ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.activity-empty-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Palette's micro-UX enhancement: Quick Actions with enhanced interactions */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  text-decoration: none;
  color: var(--color-text);
  transition: all v-bind('animationConfig.cssTransitions.normalSec')
    v-bind('animationConfig.easing.spring');
  position: relative;
  overflow: hidden;
  /* Palette's micro-UX enhancement: Entrance animation */
  opacity: 0;
  transform: translateY(20px);
  animation: action-entrance
    v-bind(
      'animationConfig.moderationDashboard?.actionEntranceDurationSec || "0.4s"'
    )
    ease-out forwards;
  animation-delay: calc(
    var(--action-delay, 0ms) +
      v-bind(
        '(animationConfig.moderationDashboard?.actionDelayOffsetMs || 600) + "ms"'
      )
  );
}

@keyframes action-entrance {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-btn:hover,
.action-btn.is-hovered {
  background: var(--color-hover);
  transform: translateY(-3px) translateX(4px);
  box-shadow: v-bind(
    'shadowsConfig.moderationDashboard?.actionHoverShadow || "0 8px 16px rgba(0, 0, 0, 0.08)"'
  );
  border-color: v-bind(
    'componentColorsConfig.moderationDashboard?.actionHoverBorder || "rgba(59, 130, 246, 0.2)"'
  );
}

/* Palette's micro-UX enhancement: Action press effect */
.action-btn.is-pressed {
  transform: scale(0.98) !important;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out;
}

.action-btn:hover .action-icon,
.action-icon.is-hovered {
  transform: scale(1.15) rotate(-5deg);
}

.action-text {
  flex: 1;
  font-weight: 500;
}

/* Palette's micro-UX enhancement: Action arrow indicator */
.action-arrow {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-tertiary);
  opacity: 0;
  transform: translateX(-8px);
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease-out;
}

.action-arrow.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Vue TransitionGroup styles */
.activity-list-enter-active,
.activity-list-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.slowerSec') ease-out;
}

.activity-list-enter-from,
.activity-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.activity-list-move {
  transition: transform v-bind('animationConfig.cssTransitions.slowerSec')
    ease-out;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Palette's micro-UX enhancement: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .activity-item,
  .action-btn {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition: opacity v-bind('animationConfig.cssTransitions.fastSec')
      ease-out;
  }

  .stat-card:hover,
  .stat-card.is-hovered {
    transform: none;
  }

  .stat-card.is-pressed,
  .action-btn.is-pressed {
    transform: scale(0.98) !important;
  }

  .activity-item:hover,
  .activity-item.is-hovered {
    transform: none;
  }

  .action-btn:hover,
  .action-btn.is-hovered {
    transform: none;
  }

  .stat-trend.is-pulsing {
    animation: none;
  }

  .stat-value.is-counting {
    color: var(--color-text);
  }

  .activity-empty-icon.animate-float {
    animation: none;
  }

  .activity-icon {
    transition: none;
  }

  .action-icon {
    transition: none;
  }

  .action-arrow {
    transition: none;
    opacity: 0.5;
    transform: none;
  }

  .stat-link-arrow {
    transition: none;
  }

  .stat-link:hover .stat-link-arrow {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .stat-card:focus-within {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .action-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .activity-item:focus-within {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-value {
    font-size: 2rem;
  }
}
</style>
