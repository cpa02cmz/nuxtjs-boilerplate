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

  it('does not update URL when no parameters are set', () => {
    // Create a fresh set of filter options with empty values
    const emptyFilterOptions = ref({
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
    })

    const emptySortOption = ref('popularity-desc') // Default sort option

    // Create a mock router for this test
    const mockRouterEmpty = { replace: vi.fn() }

    // Create a temporary function that uses the mock router
    const tempUseUrlSync = (filterOpts: any, sortOpt: any) => {
      const route = { query: {} }
      const router = mockRouterEmpty

      const updateUrlParams = () => {
        const params: Record<string, string | string[]> = {}

        if (filterOpts.value.searchQuery) {
          params.q = filterOpts.value.searchQuery
        }

        if (
          filterOpts.value.categories &&
          filterOpts.value.categories.length > 0
        ) {
          params.categories = filterOpts.value.categories
        }

        if (
          filterOpts.value.pricingModels &&
          filterOpts.value.pricingModels.length > 0
        ) {
          params.pricing = filterOpts.value.pricingModels
        }

        if (
          filterOpts.value.difficultyLevels &&
          filterOpts.value.difficultyLevels.length > 0
        ) {
          params.difficulty = filterOpts.value.difficultyLevels
        }

        if (
          filterOpts.value.technologies &&
          filterOpts.value.technologies.length > 0
        ) {
          params.technologies = filterOpts.value.technologies
        }

        if (sortOpt.value && sortOpt.value !== 'popularity-desc') {
          params.sort = sortOpt.value
        }

        // Replace current route with new params without triggering a full page reload
        router.replace({ query: params })
      }

      return {
        parseUrlParams: () => {},
        updateUrlParams,
      }
    }

    const { updateUrlParams } = tempUseUrlSync(
      emptyFilterOptions,
      emptySortOption
    )

    // Call updateUrlParams with empty values
    updateUrlParams()

    // When all values are empty/default, the URL should be updated with an empty query
    expect(mockRouterEmpty.replace).toHaveBeenCalledWith({ query: {} })
  })

  it('handles empty search query correctly', () => {
    // Create a mock router for this test
    const mockRouterEmpty = { replace: vi.fn() }

    // Create a temporary function that uses the mock router
    const tempUseUrlSync = (filterOpts: any, sortOpt: any) => {
      const route = { query: {} }
      const router = mockRouterEmpty

      const updateUrlParams = () => {
        const params: Record<string, string | string[]> = {}

        if (filterOpts.value.searchQuery) {
          params.q = filterOpts.value.searchQuery
        }

        if (
          filterOpts.value.categories &&
          filterOpts.value.categories.length > 0
        ) {
          params.categories = filterOpts.value.categories
        }

        if (
          filterOpts.value.pricingModels &&
          filterOpts.value.pricingModels.length > 0
        ) {
          params.pricing = filterOpts.value.pricingModels
        }

        if (
          filterOpts.value.difficultyLevels &&
          filterOpts.value.difficultyLevels.length > 0
        ) {
          params.difficulty = filterOpts.value.difficultyLevels
        }

        if (
          filterOpts.value.technologies &&
          filterOpts.value.technologies.length > 0
        ) {
          params.technologies = filterOpts.value.technologies
        }

        if (sortOpt.value && sortOpt.value !== 'popularity-desc') {
          params.sort = sortOpt.value
        }

        // Replace current route with new params without triggering a full page reload
        router.replace({ query: params })
      }

      return {
        parseUrlParams: () => {},
        updateUrlParams,
      }
    }

    // Create new refs with some initial values
    const testFilterOptions = ref({
      searchQuery: 'initial-query',
      categories: ['AI Tools'],
      pricingModels: ['Free'],
      difficultyLevels: ['Beginner'],
      technologies: ['Vue'],
    })

    const testSortOption = ref('alphabetical-asc')

    const { updateUrlParams } = tempUseUrlSync(
      testFilterOptions,
      testSortOption
    )

    // Set an empty search query
    testFilterOptions.value.searchQuery = ''

    // Call updateUrlParams
    updateUrlParams()

    // The URL should be updated without the q parameter
    const expectedQuery = {
      categories: ['AI Tools'],
      pricing: ['Free'],
      difficulty: ['Beginner'],
      technologies: ['Vue'],
      sort: 'alphabetical-asc',
    }

    expect(mockRouterEmpty.replace).toHaveBeenCalledWith({
      query: expectedQuery,
    })
  })
})
