<template>
  <div class="status-manager">
    <h3>{{ contentConfig.statusManager.title }}</h3>

    <div class="status-controls">
      <div class="status-selector">
        <label for="status-select">{{
          contentConfig.statusManager.labels.changeStatus
        }}</label>
        <select
          id="status-select"
          v-model="selectedStatus"
          class="status-dropdown"
        >
          <option value="active">
            {{ contentConfig.statusManager.statusOptions.active }}
          </option>
          <option value="deprecated">
            {{ contentConfig.statusManager.statusOptions.deprecated }}
          </option>
          <option value="discontinued">
            {{ contentConfig.statusManager.statusOptions.discontinued }}
          </option>
          <option value="updated">
            {{ contentConfig.statusManager.statusOptions.updated }}
          </option>
          <option value="pending">
            {{ contentConfig.statusManager.statusOptions.pending }}
          </option>
        </select>
      </div>

      <div class="reason-input">
        <label for="reason-input">{{
          contentConfig.statusManager.labels.reason
        }}</label>
        <input
          id="reason-input"
          v-model="reason"
          type="text"
          :placeholder="contentConfig.statusManager.placeholders.reason"
          class="reason-field"
        >
      </div>

      <div class="notes-input">
        <label for="notes-input">{{
          contentConfig.statusManager.labels.notes
        }}</label>
        <textarea
          id="notes-input"
          v-model="notes"
          :placeholder="contentConfig.statusManager.placeholders.notes"
          class="notes-field"
        />
      </div>

      <button
        class="update-button"
        :disabled="isUpdating || !selectedStatus"
        @click="handleUpdate"
      >
        {{
          isUpdating
            ? contentConfig.statusManager.buttons.updating
            : contentConfig.statusManager.buttons.update
        }}
      </button>
    </div>

    <div
      v-if="lastUpdate"
      class="update-result"
    >
      <div
        v-if="lastUpdate.success"
        class="success-message"
      >
        {{ contentConfig.statusManager.messages.success }}
      </div>
      <div
        v-else
        class="error-message"
      >
        {{ contentConfig.statusManager.messages.error }} {{ lastUpdate.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceStatusManager } from '~/composables/useResourceStatusManager'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { contentConfig } from '~/configs/content.config'

// Flexy hates hardcoded values! Using config instead.
const styles = componentStylesConfig.statusManager

interface Props {
  resourceId: string
  currentStatus?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentStatus: 'active',
})

const { selectedStatus, reason, notes, isUpdating, lastUpdate, updateStatus } =
  useResourceStatusManager(props.currentStatus)

const emit = defineEmits<{
  statusUpdated: [
    resource: {
      id: string
      status: string
      reason?: string
      notes?: string
    },
  ]
}>()

const handleUpdate = async () => {
  const resource = await updateStatus(props.resourceId)
  if (resource) {
    emit('statusUpdated', resource)
  }
}
</script>

<style scoped>
.status-manager {
  padding: v-bind('styles.padding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.borderColor');
  border-radius: v-bind('styles.borderRadius');
  background-color: v-bind('styles.backgroundColor');
}

.status-manager h3 {
  font-size: v-bind('styles.titleFontSize');
  font-weight: v-bind('styles.titleFontWeight');
  margin-bottom: v-bind('styles.titleMarginBottom');
  color: v-bind('styles.titleColor');
}

.status-controls {
  display: flex;
  flex-direction: column;
  gap: v-bind('styles.controlGap');
}

.status-selector,
.reason-input,
.notes-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-selector label,
.reason-input label,
.notes-input label {
  font-weight: 500;
  color: v-bind('styles.labelColor');
  font-size: v-bind('styles.labelFontSize');
}

.status-dropdown {
  padding: v-bind('styles.inputPadding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.inputBorderColor');
  border-radius: v-bind('styles.inputBorderRadius');
  background-color: white;
  font-size: v-bind('styles.inputFontSize');
}

.reason-field {
  padding: v-bind('styles.inputPadding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.inputBorderColor');
  border-radius: v-bind('styles.inputBorderRadius');
  font-size: v-bind('styles.inputFontSize');
}

.notes-field {
  padding: v-bind('styles.inputPadding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.inputBorderColor');
  border-radius: v-bind('styles.inputBorderRadius');
  font-size: v-bind('styles.inputFontSize');
  min-height: v-bind('styles.notesMinHeight');
  resize: vertical;
}

.update-button {
  align-self: flex-start;
  padding: v-bind('styles.buttonPadding');
  background-color: v-bind('styles.buttonBgColor');
  color: v-bind('styles.buttonTextColor');
  border: none;
  border-radius: v-bind('styles.buttonBorderRadius');
  cursor: pointer;
  font-weight: v-bind('styles.buttonFontWeight');
  font-size: v-bind('styles.buttonFontSize');
}

.update-button:hover:not(:disabled) {
  background-color: v-bind('styles.buttonHoverBg');
}

.update-button:disabled {
  background-color: v-bind('styles.buttonDisabledBg');
  cursor: not-allowed;
}

.update-result {
  margin-top: v-bind('styles.resultMarginTop');
  padding: v-bind('styles.resultPadding');
  border-radius: v-bind('styles.resultBorderRadius');
}

.success-message {
  color: v-bind('styles.message.success.textColor');
  background-color: v-bind('styles.message.success.bgColor');
  border: 1px solid v-bind('styles.message.success.borderColor');
}

.error-message {
  color: v-bind('styles.message.error.textColor');
  background-color: v-bind('styles.message.error.bgColor');
  border: 1px solid v-bind('styles.message.error.borderColor');
}
</style>
