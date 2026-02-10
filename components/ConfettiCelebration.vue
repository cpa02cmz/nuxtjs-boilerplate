<template>
  <Teleport to="body">
    <div v-if="isActive" class="confetti-container" aria-hidden="true">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="confetti-particle"
        :style="getParticleStyle(particle)"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface Particle {
  id: number
  color: string
  left: number
  delay: number
  duration: number
  size: number
  rotation: number
  shape: 'square' | 'circle' | 'rectangle'
}

interface Props {
  trigger?: boolean
  intensity?: 'light' | 'medium' | 'heavy'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  trigger: false,
  intensity: 'medium',
  duration: animationConfig.confetti?.durationMs || 3000,
})

const isActive = ref(false)
const particles = ref<Particle[]>([])
let cleanupTimer: ReturnType<typeof setTimeout> | null = null

// Brand colors for confetti
const confettiColors = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
]

// Get particle count based on intensity
const getParticleCount = () => {
  switch (props.intensity) {
    case 'light':
      return animationConfig.confetti?.particleCountLight || 30
    case 'heavy':
      return animationConfig.confetti?.particleCountHeavy || 100
    case 'medium':
    default:
      return animationConfig.confetti?.particleCountMedium || 60
  }
}

// Generate random particles
const generateParticles = (): Particle[] => {
  const count = getParticleCount()
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 8 + Math.random() * 8,
    rotation: Math.random() * 360,
    shape:
      Math.random() > 0.6
        ? 'circle'
        : Math.random() > 0.5
          ? 'square'
          : 'rectangle',
  }))
}

// Get particle styles
const getParticleStyle = (particle: Particle) => {
  const isRectangle = particle.shape === 'rectangle'
  return {
    backgroundColor: particle.color,
    left: `${particle.left}%`,
    width: `${particle.size}px`,
    height: isRectangle ? `${particle.size * 0.6}px` : `${particle.size}px`,
    animationDelay: `${particle.delay}s`,
    animationDuration: `${particle.duration}s`,
    borderRadius: particle.shape === 'circle' ? '50%' : '2px',
    transform: `rotate(${particle.rotation}deg)`,
  }
}

// Check if reduced motion is preferred
const shouldSkipAnimation = () => {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger confetti celebration
const celebrate = () => {
  // Skip if reduced motion is preferred
  if (shouldSkipAnimation()) return

  // Clear any existing timer
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
  }

  // Generate new particles
  particles.value = generateParticles()
  isActive.value = true

  // Auto-cleanup after animation completes
  cleanupTimer = setTimeout(() => {
    isActive.value = false
    particles.value = []
  }, props.duration + 1000)
}

// Watch for trigger prop changes
watch(
  () => props.trigger,
  newVal => {
    if (newVal) {
      celebrate()
    }
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
  }
})

// Expose celebrate method for programmatic triggering
defineExpose({
  celebrate,
})
</script>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.confetti-particle {
  position: absolute;
  top: -20px;
  animation: confetti-fall linear forwards;
  opacity: 0;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Reduced motion support - disable confetti */
@media (prefers-reduced-motion: reduce) {
  .confetti-container {
    display: none;
  }

  .confetti-particle {
    animation: none;
  }
}
</style>
