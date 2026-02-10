<template>
  <div
    ref="scrollContainer"
    class="virtual-scroll-container overflow-y-auto"
    :style="{ height: containerHeight }"
  >
    <div
      ref="scrollContent"
      :style="{
        height: `${totalHeight}px`,
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualizer.getVirtualItems()"
        :key="virtualRow.key"
        :data-index="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <slot
          :item="items[virtualRow.index]"
          :index="virtualRow.index"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { uiConfig } from '../configs/ui.config'
import { thresholdsConfig } from '../configs/thresholds.config'

interface Props {
  items: T[]
  itemHeight?: number
  overscan?: number
  containerHeight?: string
}

// Flexy says: No more hardcoded defaults! Using config values.
const props = withDefaults(defineProps<Props<T>>(), {
  itemHeight: uiConfig.virtualList.itemHeight,
  overscan: uiConfig.virtualList.overscan,
  containerHeight: thresholdsConfig.virtualList.defaultContainerHeight,
})

const scrollContainer = ref<HTMLElement | null>(null)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const virtualizer = useVirtualizer({
  count: props.items.length,
  getScrollElement: () => scrollContainer.value,
  estimateSize: () => props.itemHeight,
  overscan: props.overscan,
})

// Flexy hates hardcoded scrollbar colors! Using uiConfig
const scrollbarConfig = uiConfig.scrollbar
</script>

<style scoped>
.virtual-scroll-container {
  scrollbar-width: thin;
  /* Flexy hates hardcoded values! Using v-bind with uiConfig */
  scrollbar-color: v-bind('scrollbarConfig.thumbColor')
    v-bind('scrollbarConfig.trackColor');
}

.virtual-scroll-container::-webkit-scrollbar {
  width: v-bind('scrollbarConfig.width');
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: v-bind('scrollbarConfig.trackColor');
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: v-bind('scrollbarConfig.thumbColor');
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: v-bind('scrollbarConfig.thumbHoverColor');
}
</style>
