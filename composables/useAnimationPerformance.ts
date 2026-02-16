// Animation Performance Composable - Issue #2752 Fix
// Provides GPU acceleration, animation budget tracking, and low-end device detection
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'

interface AnimationBudget {
  activeAnimations: number
  maxConcurrent: number
  canAnimate: boolean
}

interface PerformanceState {
  isLowEndDevice: boolean
  prefersReducedMotion: boolean
  isBatteryLow: boolean
  fps: number
  connectionType: string
  memoryLimit: number
}

interface BatteryManager {
  level: number
  charging: boolean
}

type NavigatorExtended = Navigator & {
  getBattery?: () => Promise<BatteryManager>
  connection?: {
    effectiveType: string
  }
  deviceMemory?: number
  hardwareConcurrency?: number
}

// Track global animation budget
const globalAnimationCount = ref(0)
const lastFrameTime = ref(performance.now())
const frameCount = ref(0)
const currentFps = ref(60)

export function useAnimationPerformance() {
  const performanceState = ref<PerformanceState>({
    isLowEndDevice: false,
    prefersReducedMotion: false,
    isBatteryLow: false,
    fps: 60,
    connectionType: 'unknown',
    memoryLimit: 0,
  })

  const animationBudget = computed<AnimationBudget>(() => {
    const maxConcurrent = performanceState.value.isLowEndDevice
      ? 1
      : animationConfig.performance.animationBudget.maxConcurrent

    return {
      activeAnimations: globalAnimationCount.value,
      maxConcurrent,
      canAnimate:
        globalAnimationCount.value < maxConcurrent &&
        !performanceState.value.prefersReducedMotion &&
        currentFps.value >=
          animationConfig.performance.animationBudget.minFpsThreshold,
    }
  })

  // Check for reduced motion preference
  const checkReducedMotion = () => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return true
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Detect low-end device
  const detectLowEndDevice = () => {
    if (typeof navigator === 'undefined') return false

    const perfConfig = animationConfig.performance.lowEndDetection
    const nav = navigator as NavigatorExtended

    // Check memory
    if (
      nav.deviceMemory &&
      nav.deviceMemory < perfConfig.memoryLimitMB / 1024
    ) {
      return true
    }

    // Check CPU cores
    if (
      nav.hardwareConcurrency &&
      nav.hardwareConcurrency < perfConfig.cpuCoreThreshold
    ) {
      return true
    }

    // Check connection
    if (
      nav.connection &&
      perfConfig.slowConnections.includes(nav.connection.effectiveType)
    ) {
      return true
    }

    return false
  }

  // Check battery status
  const checkBatteryStatus = async () => {
    if (typeof navigator === 'undefined') return false

    const nav = navigator as NavigatorExtended
    if (!nav.getBattery) return false

    try {
      const battery = await nav.getBattery()
      const threshold =
        animationConfig.performance.batteryAware.lowBatteryThreshold
      return battery.level < threshold && !battery.charging
    } catch {
      return false
    }
  }

  // Get connection type
  const getConnectionType = () => {
    if (typeof navigator === 'undefined') return 'unknown'
    const nav = navigator as NavigatorExtended
    return nav.connection?.effectiveType || 'unknown'
  }

  // Monitor frame rate
  let fpsRafId: number | null = null
  const monitorFrameRate = () => {
    if (!animationConfig.performance.frameRateMonitoring.enabled) return

    const checkFps = () => {
      const now = performance.now()
      frameCount.value++

      // Flexy hates hardcoded 1000! Using animationConfig.performance.frameRateMonitoring.sampleIntervalMs
      if (
        now - lastFrameTime.value >=
        animationConfig.performance.frameRateMonitoring.sampleIntervalMs
      ) {
        currentFps.value = frameCount.value
        frameCount.value = 0
        lastFrameTime.value = now
        performanceState.value.fps = currentFps.value
      }

      fpsRafId = requestAnimationFrame(checkFps)
    }

    fpsRafId = requestAnimationFrame(checkFps)
  }

  // Acquire animation slot
  const acquireAnimationSlot = (): boolean => {
    if (!animationBudget.value.canAnimate) {
      return false
    }
    globalAnimationCount.value++
    return true
  }

  // Release animation slot
  const releaseAnimationSlot = () => {
    globalAnimationCount.value = Math.max(0, globalAnimationCount.value - 1)
  }

  // Get GPU acceleration styles
  const getGpuAccelerationStyles = () => {
    if (!animationConfig.performance.gpuAcceleration.enabled) {
      return {}
    }

    const styles: Record<string, string> = {}

    if (animationConfig.performance.gpuAcceleration.useTranslateZ) {
      styles.transform = 'translateZ(0)'
    }

    if (
      animationConfig.performance.gpuAcceleration.willChangeStrategy !== 'never'
    ) {
      styles.willChange =
        animationConfig.performance.gpuAcceleration.willChangeProperties
    }

    return styles
  }

  // Initialize performance detection
  let mediaQueryRef: MediaQueryList | null = null

  onMounted(async () => {
    // Check reduced motion
    performanceState.value.prefersReducedMotion = checkReducedMotion()

    // Listen for reduced motion changes
    if (typeof window !== 'undefined') {
      mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQueryRef.addEventListener('change', (e: MediaQueryListEvent) => {
        performanceState.value.prefersReducedMotion = e.matches
      })
    }

    // Detect low-end device
    performanceState.value.isLowEndDevice = detectLowEndDevice()
    performanceState.value.connectionType = getConnectionType()

    // Check battery
    if (animationConfig.performance.batteryAware.enabled) {
      performanceState.value.isBatteryLow = await checkBatteryStatus()
    }

    // Get memory info
    if (typeof navigator !== 'undefined') {
      const nav = navigator as NavigatorExtended
      if (nav.deviceMemory) {
        performanceState.value.memoryLimit = nav.deviceMemory * 1024
      }
    }

    // Start FPS monitoring
    monitorFrameRate()
  })

  onUnmounted(() => {
    if (mediaQueryRef) {
      mediaQueryRef.removeEventListener('change', () => {})
    }
    if (fpsRafId !== null) {
      cancelAnimationFrame(fpsRafId)
    }
  })

  return {
    performanceState,
    animationBudget,
    acquireAnimationSlot,
    releaseAnimationSlot,
    getGpuAccelerationStyles,
    currentFps,
  }
}
