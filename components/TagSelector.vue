<template>
  <div class="tag-selector">
    <div class="tag-input-container">
      <div
        class="selected-tags flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[40px] bg-white"
        role="combobox"
        aria-expanded="false"
        aria-controls="tag-suggestions"
        @click="focusInput"
      >
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="tag-badge bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
          :tabindex="0"
          @keydown.delete="removeTag(tag)"
        >
          {{ tag }}
          <button
            type="button"
            class="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            :aria-label="`Remove ${tag} tag`"
            @click="removeTag(tag)"
          >
            ×
          </button>
        </span>
        <input
          ref="tagInputRef"
          v-model="inputValue"
          type="text"
          class="flex-grow outline-none border-none p-1 min-w-[100px]"
          placeholder="Add tags..."
          role="searchbox"
          aria-label="Add tags"
          aria-autocomplete="list"
          aria-controls="tag-suggestions"
          @keydown.delete="handleBackspace"
          @keydown.enter.prevent="handleEnter"
          @keydown.arrow-down.prevent="highlightNextSuggestion"
          @keydown.arrow-up.prevent="highlightPrevSuggestion"
          @keydown.esc="closeSuggestions"
          @focus="showSuggestions = true"
          @blur="handleBlur"
        />
      </div>

      <!-- Tag suggestions dropdown -->
      <div
        v-if="filteredSuggestions.length > 0 && showSuggestions && inputValue"
        id="tag-suggestions"
        class="suggestions-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        role="listbox"
        aria-label="Tag suggestions"
      >
        <div
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion.id"
          role="option"
          :aria-selected="index === highlightedIndex"
          class="suggestion-item p-3 hover:bg-gray-100 cursor-pointer flex items-start"
          :class="{ 'bg-blue-50': index === highlightedIndex }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="flex-1">
            <div class="font-medium text-gray-900">{{ suggestion.name }}</div>
            <div
              v-if="suggestion.description"
              class="text-sm text-gray-500 mt-1"
            >
              {{ suggestion.description }}
            </div>
            <div
              v-if="suggestion.level && suggestion.level > 0"
              class="text-xs text-gray-400 mt-1"
            >
              {{ '→ '.repeat(suggestion.level) }}
              {{ getParentPath(suggestion) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HierarchicalTag } from '~/types/resource'

interface Props {
  allTags: HierarchicalTag[]
  selectedTags: string[]
}

interface Emits {
  (event: 'update:selectedTags', tags: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputValue = ref('')
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)
const tagInputRef = ref<HTMLInputElement | null>(null)

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!inputValue.value || !showSuggestions.value) return []

  const query = inputValue.value.toLowerCase()
  const results: HierarchicalTag[] = []

  const searchTags = (tags: readonly HierarchicalTag[], level = 0): void => {
    for (const tag of tags) {
      // Check if tag matches query in name, synonyms, or description
      const matches =
        tag.name.toLowerCase().includes(query) ||
        (tag.synonyms &&
          tag.synonyms.some(synonym =>
            synonym.toLowerCase().includes(query)
          )) ||
        (tag.description && tag.description.toLowerCase().includes(query))

      if (matches && !props.selectedTags.includes(tag.name)) {
        results.push({ ...tag, level })
      }

      // Search children recursively
      if (tag.children) {
        searchTags(tag.children, level + 1)
      }
    }
  }

  searchTags(props.allTags)
  return results.slice(0, 10) // Limit to 10 suggestions
})

const getParentPath = (tag: HierarchicalTag): string => {
  if (!tag.path) return ''
  return tag.path.join(' → ')
}

const focusInput = () => {
  tagInputRef.value?.focus()
  showSuggestions.value = true
}

const removeTag = (tag: string) => {
  const updatedTags = props.selectedTags.filter(t => t !== tag)
  emit('update:selectedTags', updatedTags)
}

const handleBackspace = () => {
  if (inputValue.value === '' && props.selectedTags.length > 0) {
    // Remove last tag when backspace is pressed on empty input
    const updatedTags = [...props.selectedTags]
    updatedTags.pop()
    emit('update:selectedTags', updatedTags)
  }
}

const handleEnter = () => {
  if (
    highlightedIndex.value >= 0 &&
    filteredSuggestions.value[highlightedIndex.value]
  ) {
    // Select the highlighted suggestion
    selectSuggestion(filteredSuggestions.value[highlightedIndex.value])
  } else if (
    inputValue.value.trim() &&
    !props.selectedTags.includes(inputValue.value.trim())
  ) {
    // Add new tag if it doesn't exist in selected tags
    const newTags = [...props.selectedTags, inputValue.value.trim()]
    emit('update:selectedTags', newTags)
    inputValue.value = ''
  }
}

const selectSuggestion = (suggestion: HierarchicalTag) => {
  if (!props.selectedTags.includes(suggestion.name)) {
    const newTags = [...props.selectedTags, suggestion.name]
    emit('update:selectedTags', newTags)
  }
  inputValue.value = ''
  showSuggestions.value = false
  highlightedIndex.value = -1
  tagInputRef.value?.focus()
}

const highlightNextSuggestion = () => {
  if (filteredSuggestions.value.length === 0) return
  highlightedIndex.value =
    (highlightedIndex.value + 1) % filteredSuggestions.value.length
}

const highlightPrevSuggestion = () => {
  if (filteredSuggestions.value.length === 0) return
  highlightedIndex.value =
    highlightedIndex.value <= 0
      ? filteredSuggestions.value.length - 1
      : highlightedIndex.value - 1
}

const closeSuggestions = () => {
  showSuggestions.value = false
  highlightedIndex.value = -1
}

const handleBlur = () => {
  // Delay closing suggestions to allow click events on suggestions to register
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 150)
}
</script>

<style scoped>
.tag-selector {
  position: relative;
}

.selected-tags:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
