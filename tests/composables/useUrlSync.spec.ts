import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useUrlSync } from '~/composables/useUrlSync'

// Mock vue-router
const mockRoute = {
  query: {
    q: 'test',
    categories: ['AI Tools'],
    pricing: ['Free'],
    difficulty: ['Beginner'],
    technologies: ['Vue'],
    sort: 'alphabetical-asc',
  },
}

const mockRouter = {
  replace: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}))

describe('useUrlSync', () => {
  let filterOptions: any
  let sortOption: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    filterOptions = ref({
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
    })

    sortOption = ref('popularity-desc')
  })

  it('parses URL parameters correctly', async () => {
    // Reset the initial mock router calls
    mockRouter.replace.mockClear()

    // Create a wrapper component to properly handle the onMounted lifecycle
    const WrapperComponent = defineComponent({
      setup() {
        useUrlSync(filterOptions, sortOption)
        return {}
      },
      render() {
        return null
      },
    })

    const wrapper = mount(WrapperComponent)
    await nextTick() // Wait for onMounted to execute

    expect(filterOptions.value.searchQuery).toBe('test')
    expect(filterOptions.value.categories).toEqual(['AI Tools'])
    expect(filterOptions.value.pricingModels).toEqual(['Free'])
    expect(filterOptions.value.difficultyLevels).toEqual(['Beginner'])
    expect(filterOptions.value.technologies).toEqual(['Vue'])
    expect(sortOption.value).toBe('alphabetical-asc')

    wrapper.unmount()
  })

  it('updates URL parameters correctly', async () => {
    // Reset the initial mock router calls
    mockRouter.replace.mockClear()

    // Create a wrapper component to properly handle the onMounted lifecycle
    const WrapperComponent = defineComponent({
      setup() {
        useUrlSync(filterOptions, sortOption)
        return {}
      },
      render() {
        return null
      },
    })

    const wrapper = mount(WrapperComponent)
    await nextTick() // Wait for onMounted to execute

    // Clear the initial call from onMounted
    mockRouter.replace.mockClear()

    filterOptions.value.searchQuery = 'updated query'
    filterOptions.value.categories = ['Development']
    filterOptions.value.pricingModels = ['Freemium']
    filterOptions.value.difficultyLevels = ['Intermediate']
    filterOptions.value.technologies = ['React']
    sortOption.value = 'date-added-desc'

    // Wait for the watcher to trigger the updateUrlParams
    await nextTick()

    // Check that the router was called with the expected parameters
    // (including the updated values from the filter changes)
    const expectedQuery = {
      q: 'updated query',
      categories: ['Development'],
      pricing: ['Freemium'],
      difficulty: ['Intermediate'],
      technologies: ['React'],
      sort: 'date-added-desc',
    }

    expect(mockRouter.replace).toHaveBeenCalledWith({ query: expectedQuery })

    wrapper.unmount()
  })

  it('can be instantiated without errors', () => {
    // Simple test to ensure the composable can be used without errors
    const { parseUrlParams, updateUrlParams } = useUrlSync(
      filterOptions,
      sortOption
    )

    expect(parseUrlParams).toBeDefined()
    expect(updateUrlParams).toBeDefined()
  })

  it('watches for changes and updates URL', async () => {
    // Reset the initial mock router calls
    mockRouter.replace.mockClear()

    // Create a wrapper component to properly handle the onMounted lifecycle
    const WrapperComponent = defineComponent({
      setup() {
        useUrlSync(filterOptions, sortOption)
        return {}
      },
      render() {
        return null
      },
    })

    const wrapper = mount(WrapperComponent)
    await nextTick() // Wait for onMounted to execute

    // Clear the initial call from onMounted
    mockRouter.replace.mockClear()

    // Update filter options to trigger the watcher
    filterOptions.value.searchQuery = 'new search'

    // Wait for the watcher to trigger
    await nextTick()

    // The URL should have been updated
    expect(mockRouter.replace).toHaveBeenCalled()

    wrapper.unmount()
  })
})
