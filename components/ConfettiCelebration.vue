<template>
  <ClientOnly>
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
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { themeConfig } from '~/configs/theme.config'
import { useAnimationPerformance } from '~/composables/useAnimationPerformance'

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
  duration: animationConfig.confetti!.durationMs,
})

const isActive = ref(false)
const particles = ref<Particle[]>([])
let cleanupTimer: ReturnType<typeof setTimeout> | null = null

// Performance optimization - Issue #2752
const { acquireAnimationSlot, releaseAnimationSlot, getGpuAccelerationStyles } =
  useAnimationPerformance()
const animationSlotAcquired = ref(false)

// GPU acceleration styles
const gpuStyles = getGpuAccelerationStyles()

// Brand colors for confetti - Flexy gets them from config, no hardcoding!
// No fallback needed - config always provides default values
const confettiColors = animationConfig.confetti.colors

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

// Generate random particles - Flexy uses config values, no magic numbers!
const generateParticles = (): Particle[] => {
  const count = getParticleCount()
  const conf = animationConfig.confetti
  const delayMaxSec = conf?.delayMaxSec ?? 0.5
  const durationMinSec = conf?.durationMinSec ?? 1.5
  const durationMaxSec = conf?.durationMaxSec ?? 3.0
  const sizeMin = conf?.particleSizeMin ?? 8
  const sizeMax = conf?.particleSizeMax ?? 16
  const circleThreshold = conf?.shapeProbability?.circle ?? 0.6
  const squareThreshold = conf?.shapeProbability?.square ?? 0.5

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    left: Math.random() * 100,
    delay: Math.random() * delayMaxSec,
    duration:
      durationMinSec + Math.random() * (durationMaxSec - durationMinSec),
    size: sizeMin + Math.random() * (sizeMax - sizeMin),
    rotation: Math.random() * 360,
    shape:
      Math.random() > circleThreshold
        ? 'circle'
        : Math.random() > squareThreshold
          ? 'square'
          : 'rectangle',
  }))
}

// Get particle styles - Flexy calculates dimensions from config!
// Issue #2752: Added GPU acceleration for smooth 60fps animations
const getParticleStyle = (particle: Particle) => {
  const isRectangle = particle.shape === 'rectangle'
  const rectangleRatio = animationConfig.confetti?.rectangleHeightRatio ?? 0.6
  return {
    backgroundColor: particle.color,
    left: `${particle.left}%`,
    width: `${particle.size}px`,
    height: isRectangle
      ? `${particle.size * rectangleRatio}px`
      : `${particle.size}px`,
    animationDelay: `${particle.delay}s`,
    animationDuration: `${particle.duration}s`,
    borderRadius: particle.shape === 'circle' ? '50%' : '2px',
    transform: `rotate(${particle.rotation}deg) translateZ(0)`,
    willChange: 'transform, opacity',
    ...gpuStyles,
  }
}

// Check if reduced motion is preferred
const shouldSkipAnimation = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger confetti celebration
const celebrate = () => {
  // Skip if reduced motion is preferred
  if (shouldSkipAnimation()) return

  // Performance budget check - Issue #2752
  if (!animationSlotAcquired.value) {
    if (!acquireAnimationSlot()) {
      // Animation budget exceeded, silently skip
      return
    }
    animationSlotAcquired.value = true
  }

  // Clear any existing timer
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
  }

  // Generate new particles (respecting particle budget)
  particles.value = generateParticles()
  isActive.value = true

  // Auto-cleanup after animation completes - Flexy uses configurable buffer!
  const cleanupBufferMs = animationConfig.confetti?.cleanupBufferMs ?? 1000
  cleanupTimer = setTimeout(() => {
    isActive.value = false
    particles.value = []
    // Release animation slot
    if (animationSlotAcquired.value) {
      releaseAnimationSlot()
      animationSlotAcquired.value = false
    }
  }, props.duration + cleanupBufferMs)
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
  // Release animation slot if still held - Issue #2752
  if (animationSlotAcquired.value) {
    releaseAnimationSlot()
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
  /* Flexy hates hardcoded z-index values! Using config instead. */
  z-index: v-bind('themeConfig.zIndex.confetti');
  overflow: hidden;
}

.confetti-particle {
  position: absolute;
  top: -20px;
  animation: confetti-fall linear forwards;
  opacity: 0;
  /* Issue #2752: GPU acceleration for smooth animations */
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
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
