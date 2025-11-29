<template>
  <div class="comparison-table-container">
    <div v-if="selectedResources.length < 2" class="no-comparison">
      <p>Select 2-4 resources to compare them side-by-side</p>
    </div>

    <div v-else class="comparison-table-wrapper">
      <!-- Desktop/Tablet View -->
      <div class="comparison-table desktop-table">
        <div class="table-header">
          <div class="criteria-column">Criteria</div>
          <div
            v-for="resource in selectedResources"
            :key="resource.id"
            class="resource-column"
          >
            <div class="resource-header">
              <h3>{{ resource.title }}</h3>
              <p class="resource-url">{{ resource.url }}</p>
            </div>
          </div>
        </div>

        <div class="table-body">
          <!-- Pricing Section -->
          <div class="criteria-section">
            <h4 class="section-title">Pricing</h4>

            <div class="table-row">
              <div class="criteria-cell">Pricing Model</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-pricing`"
                class="resource-cell"
              >
                {{ resource.pricingModel }}
              </div>
            </div>

            <div class="table-row">
              <div class="criteria-cell">Free Tier</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-freetier`"
                class="resource-cell"
              >
                {{ resource.specifications?.freeTier || 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Features Section -->
          <div class="criteria-section">
            <h4 class="section-title">Features</h4>

            <div class="table-row">
              <div class="criteria-cell">Core Features</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-features`"
                class="resource-cell"
              >
                <ul v-if="resource.features && resource.features.length">
                  <li
                    v-for="(feature, idx) in resource.features.slice(0, 3)"
                    :key="idx"
                  >
                    {{ feature }}
                  </li>
                  <li v-if="resource.features.length > 3">
                    +{{ resource.features.length - 3 }} more
                  </li>
                </ul>
                <span v-else>N/A</span>
              </div>
            </div>

            <div class="table-row">
              <div class="criteria-cell">Benefits</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-benefits`"
                class="resource-cell"
              >
                <ul v-if="resource.benefits && resource.benefits.length">
                  <li
                    v-for="(benefit, idx) in resource.benefits.slice(0, 3)"
                    :key="idx"
                  >
                    {{ benefit }}
                  </li>
                  <li v-if="resource.benefits.length > 3">
                    +{{ resource.benefits.length - 3 }} more
                  </li>
                </ul>
                <span v-else>N/A</span>
              </div>
            </div>
          </div>

          <!-- Technical Section -->
          <div class="criteria-section">
            <h4 class="section-title">Technical</h4>

            <div class="table-row">
              <div class="criteria-cell">Platforms</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-platforms`"
                class="resource-cell"
              >
                {{ resource.platforms?.join(', ') || 'N/A' }}
              </div>
            </div>

            <div class="table-row">
              <div class="criteria-cell">Technologies</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-tech`"
                class="resource-cell"
              >
                {{ resource.technology.join(', ') }}
              </div>
            </div>
          </div>

          <!-- Quality Section -->
          <div class="criteria-section">
            <h4 class="section-title">Quality</h4>

            <div class="table-row">
              <div class="criteria-cell">Rating</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-rating`"
                class="resource-cell"
              >
                {{ resource.rating || 'N/A' }}
              </div>
            </div>

            <div class="table-row">
              <div class="criteria-cell">Popularity</div>
              <div
                v-for="resource in selectedResources"
                :key="`${resource.id}-popularity`"
                class="resource-cell"
              >
                {{ resource.popularity }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile View -->
      <div class="comparison-table mobile-table">
        <div
          v-for="resource in selectedResources"
          :key="resource.id"
          class="mobile-resource-card"
        >
          <h3>{{ resource.title }}</h3>
          <p class="resource-url">{{ resource.url }}</p>

          <div class="mobile-comparison-section">
            <h4>Pricing</h4>
            <p><strong>Model:</strong> {{ resource.pricingModel }}</p>
            <p>
              <strong>Free Tier:</strong>
              {{ resource.specifications?.freeTier || 'N/A' }}
            </p>
          </div>

          <div class="mobile-comparison-section">
            <h4>Features</h4>
            <div v-if="resource.features && resource.features.length">
              <p
                v-for="(feature, idx) in resource.features.slice(0, 3)"
                :key="idx"
              >
                • {{ feature }}
              </p>
              <p v-if="resource.features.length > 3">
                +{{ resource.features.length - 3 }} more
              </p>
            </div>
            <p v-else>N/A</p>
          </div>

          <div class="mobile-comparison-section">
            <h4>Technical</h4>
            <p>
              <strong>Platforms:</strong>
              {{ resource.platforms?.join(', ') || 'N/A' }}
            </p>
            <p>
              <strong>Technologies:</strong>
              {{ resource.technology.join(', ') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'

interface Props {
  selectedResources: Resource[]
}

defineProps<Props>()
</script>

<style scoped>
.comparison-table-container {
  width: 100%;
  overflow-x: auto;
}

.no-comparison {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.comparison-table-wrapper {
  width: 100%;
}

.comparison-table.desktop-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e0e0e0;
}

.table-header {
  display: table-header-group;
  background-color: #f5f5f5;
}

.table-header > div {
  display: table-cell;
  padding: 1rem;
  font-weight: bold;
  border-bottom: 2px solid #e0e0e0;
  vertical-align: top;
}

.criteria-column {
  width: 200px;
  min-width: 200px;
}

.resource-column {
  width: calc((100% - 200px) / 3); /* Adjust based on number of resources */
  min-width: 200px;
}

.table-body {
  display: table-row-group;
}

.criteria-section {
  margin-bottom: 1rem;
}

.section-title {
  background-color: #f9f9f9;
  padding: 0.5rem 1rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.table-row {
  display: table-row;
}

.table-row:nth-child(even) {
  background-color: #fafafa;
}

.criteria-cell {
  display: table-cell;
  padding: 0.75rem 1rem;
  font-weight: 500;
  border-right: 1px solid #e0e0e0;
  vertical-align: top;
  width: 200px;
}

.resource-cell {
  display: table-cell;
  padding: 0.75rem 1rem;
  border-right: 1px solid #e0e0e0;
  vertical-align: top;
}

.resource-cell:last-child {
  border-right: none;
}

.resource-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #333;
}

.resource-url {
  font-size: 0.85rem;
  color: #007acc;
  margin: 0;
}

.table-row ul {
  margin: 0;
  padding-left: 1rem;
}

.table-row li {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

/* Mobile Styles */
.comparison-table.mobile-table {
  display: none;
}

.mobile-resource-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: white;
}

.mobile-resource-card h3 {
  margin-top: 0;
  color: #333;
}

.mobile-comparison-section {
  margin-bottom: 1rem;
}

.mobile-comparison-section h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #555;
  font-size: 1rem;
}

.mobile-comparison-section p {
  margin: 0.25rem 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .comparison-table.desktop-table {
    display: none;
  }

  .comparison-table.mobile-table {
    display: block;
  }

  .criteria-column,
  .resource-column,
  .criteria-cell,
  .resource-cell {
    display: block;
    width: 100% !important;
    border-right: none;
  }

  .table-row {
    display: block;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }
}
</style>
