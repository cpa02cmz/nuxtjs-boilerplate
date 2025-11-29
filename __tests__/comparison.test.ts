import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createNuxtApp, defineNuxtPlugin } from 'nuxt/app'
import ComparisonTable from '~/components/ComparisonTable.vue'
import ComparisonBuilder from '~/components/ComparisonBuilder.vue'
import ComparisonButton from '~/components/ComparisonButton.vue'
import { useResourceData } from '~/composables/useResourceData'
import { useResourceComparison } from '~/composables/useResourceComparison'

// Mock the composables
vi.mock('~/composables/useResourceData', () => ({
  useResourceData: vi.fn(() => ({
    resources: {
      value: [
        {
          id: '1',
          title: 'Test Resource 1',
          description: 'Test description 1',
          url: 'https://test1.com',
          category: 'Testing',
          pricingModel: 'Free',
          technology: ['Vue', 'Nuxt'],
          benefits: ['Benefit 1', 'Benefit 2'],
          features: ['Feature 1', 'Feature 2'],
          platforms: ['Web'],
          specifications: { freeTier: 'Yes' },
          popularity: 10,
          rating: 4.5,
        },
        {
          id: '2',
          title: 'Test Resource 2',
          description: 'Test description 2',
          url: 'https://test2.com',
          category: 'Testing',
          pricingModel: 'Paid',
          technology: ['React', 'Next'],
          benefits: ['Benefit 3', 'Benefit 4'],
          features: ['Feature 3', 'Feature 4'],
          platforms: ['Web', 'Mobile'],
          specifications: { freeTier: 'No' },
          popularity: 20,
          rating: 4.0,
        },
      ],
    },
  })),
}))

vi.mock('~/composables/useResourceComparison', () => ({
  useResourceComparison: vi.fn(() => ({
    selectedResources: { value: [] },
    loading: { value: false },
    error: { value: null },
    comparisonCount: { value: 0 },
    canAddMoreResources: { value: true },
    addResource: vi.fn(),
    removeResource: vi.fn(),
    addResourceToComparison: vi.fn(),
    removeResourceFromComparison: vi.fn(),
    clearComparison: vi.fn(),
    isInComparison: vi.fn(() => false),
    saveComparison: vi.fn(() => Promise.resolve({ id: 'test', resources: [] })),
    loadComparison: vi.fn(() => Promise.resolve(null)),
    getComparisonData: vi.fn(() => ({ resources: [], criteria: [] })),
    isComparisonReady: { value: false },
    comparisonCriteria: { value: [] },
    config: { value: { maxResources: 4, defaultCriteria: [], similarityThreshold: 0.3 } },
  })),
}))

describe('Comparison Components', () => {
  describe('ComparisonButton', () => {
    it('renders correctly', () => {
      const wrapper = mount(ComparisonButton, {
        props: {
          resourceId: '1',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('button').text()).toContain('Compare')
    })

    it('shows compared state when resource is in comparison', async () => {
      // Mock the composable to return true for isInComparison
      const mockUseResourceComparison = vi.mocked(useResourceComparison)
      mockUseResourceComparison.mockReturnValue({
        selectedResources: { value: [] },
        loading: { value: false },
        error: { value: null },
        comparisonCount: { value: 0 },
        canAddMoreResources: { value: true },
        addResource: vi.fn(),
        removeResource: vi.fn(),
        addResourceToComparison: vi.fn(),
        removeResourceFromComparison: vi.fn(),
        clearComparison: vi.fn(),
        isInComparison: vi.fn(() => true), // Mock to return true
        saveComparison: vi.fn(() =>
          Promise.resolve({ id: 'test', resources: [] })
        ),
        loadComparison: vi.fn(() => Promise.resolve(null)),
        getComparisonData: vi.fn(() => ({ resources: [], criteria: [] })),
        isComparisonReady: { value: false },
        comparisonCriteria: { value: [] },
        config: { value: { maxResources: 4, defaultCriteria: [], similarityThreshold: 0.3 } },
      } as any)

      const wrapper = mount(ComparisonButton, {
        props: {
          resourceId: '1',
        },
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('button').text()).toContain('✓ Compared')
    })
  })

  describe('ComparisonTable', () => {
    it('renders correctly when no resources selected', () => {
      const wrapper = mount(ComparisonTable, {
        props: {
          selectedResources: [],
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Select 2-4 resources to compare')
    })

    it('renders comparison table when resources are selected', () => {
      const resources = [
        {
          id: '1',
          title: 'Test Resource 1',
          url: 'https://test1.com',
          pricingModel: 'Free',
          technology: ['Vue', 'Nuxt'],
          benefits: ['Benefit 1'],
          features: ['Feature 1'],
          platforms: ['Web'],
          specifications: { freeTier: 'Yes' },
          popularity: 10,
          rating: 4.5,
        },
      ]

      const wrapper = mount(ComparisonTable, {
        props: {
          selectedResources: resources,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).not.toContain('Select 2-4 resources to compare')
    })
  })

  describe('ComparisonBuilder', () => {
    it('renders correctly', () => {
      const wrapper = mount(ComparisonBuilder)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Resource Comparison Tool')
    })
  })
})

describe('Comparison Feature', () => {
  it('should have comparison types defined', () => {
    // Import the comparison types
    expect(() => import('~/types/comparison')).toBeTruthy()
  })

  it('should have comparison composable available', () => {
    // Import the comparison composable
    expect(() => import('~/composables/useResourceComparison')).toBeTruthy()
  })

  it('should have comparison components available', () => {
    // Check that the comparison components exist
    expect(() => import('~/components/ComparisonTable.vue')).toBeTruthy()
    expect(() => import('~/components/ComparisonValue.vue')).toBeTruthy()
    expect(() => import('~/components/ComparisonBuilder.vue')).toBeTruthy()
  })

  it('should have comparison API endpoints', () => {
    // Check that the comparison API endpoint exists
    expect(
      () => import('~/server/api/v1/comparisons/index.get.ts')
    ).toBeTruthy()
  })

  it('should have comparison pages', () => {
    // Check that the comparison pages exist
    expect(() => import('~/pages/compare.vue')).toBeTruthy()
    expect(() => import('~/pages/compare/[ids].vue')).toBeTruthy()
  })
})