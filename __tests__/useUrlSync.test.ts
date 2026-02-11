import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, defineComponent } from 'vue'
import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useUrlSync } from '~/composables/useUrlSync'
import type { FilterOptions, SortOption } from '~/types/resource'

const mockReplace = vi.fn()
const mockRoute = ref({
  query: {} as any,
  path: '/search',
})

vi.mock('#imports', () => ({
  useRoute: () => ({
    get query() {
      return mockRoute.value.query
    },
    get path() {
      return mockRoute.value.path
    },
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('useUrlSync', () => {
  let filterOptions: Ref<FilterOptions>
  let sortOption: Ref<SortOption>

  beforeEach(() => {
    filterOptions = ref({
      searchQuery: '',
      categories: [],
      pricingModels: [],
      difficultyLevels: [],
      technologies: [],
    })
    sortOption = ref<SortOption>('popularity-desc')
    mockReplace.mockClear()
    mockRoute.value = {
      query: {},
      path: '/search',
    }
  })

  const setupUrlSync = () => {
    const TestComponent = defineComponent({
      setup() {
        return useUrlSync(filterOptions, sortOption)
      },
      template: '<div></div>',
    })
    const wrapper = mount(TestComponent)
    return wrapper.vm as any as ReturnType<typeof useUrlSync>
  }

  describe('parseUrlParams', () => {
    it('should parse search query from URL', () => {
      mockRoute.value = {
        query: { q: 'test query' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('test query')
    })

    it('should handle search query as array and take first element', () => {
      mockRoute.value = {
        query: { q: ['first', 'second'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('first')
    })

    it('should parse categories from URL', () => {
      mockRoute.value = {
        query: { categories: 'Testing' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.categories).toEqual(['Testing'])
    })

    it('should handle categories as array', () => {
      mockRoute.value = {
        query: { categories: ['Testing', 'Development'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.categories).toEqual(['Testing', 'Development'])
    })

    it('should filter out null values from categories', () => {
      mockRoute.value = {
        query: { categories: ['Testing', null, 'Development'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.categories).toEqual(['Testing', 'Development'])
    })

    it('should parse pricing models from URL', () => {
      mockRoute.value = {
        query: { pricing: 'Free' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.pricingModels).toEqual(['Free'])
    })

    it('should handle pricing models as array', () => {
      mockRoute.value = {
        query: { pricing: ['Free', 'Paid'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.pricingModels).toEqual(['Free', 'Paid'])
    })

    it('should parse difficulty levels from URL', () => {
      mockRoute.value = {
        query: { difficulty: 'Beginner' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.difficultyLevels).toEqual(['Beginner'])
    })

    it('should handle difficulty levels as array', () => {
      mockRoute.value = {
        query: { difficulty: ['Beginner', 'Intermediate'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.difficultyLevels).toEqual([
        'Beginner',
        'Intermediate',
      ])
    })

    it('should parse technologies from URL', () => {
      mockRoute.value = {
        query: { technologies: 'Vue.js' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.technologies).toEqual(['Vue.js'])
    })

    it('should handle technologies as array', () => {
      mockRoute.value = {
        query: { technologies: ['Vue.js', 'React'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.technologies).toEqual(['Vue.js', 'React'])
    })

    it('should parse sort option from URL', () => {
      mockRoute.value = {
        query: { sort: 'alphabetical-asc' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(sortOption.value).toBe('alphabetical-asc')
    })

    it('should handle sort as array and take first element', () => {
      mockRoute.value = {
        query: { sort: ['alphabetical-asc', 'popularity-desc'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(sortOption.value).toBe('alphabetical-asc')
    })

    it('should not set sort option if value is null', () => {
      sortOption.value = 'popularity-desc'
      mockRoute.value = {
        query: { sort: null },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(sortOption.value).toBe('popularity-desc')
    })

    it('should parse all URL parameters together', () => {
      mockRoute.value = {
        query: {
          q: 'test',
          categories: 'Testing',
          pricing: 'Free',
          difficulty: 'Beginner',
          technologies: 'Vue.js',
          sort: 'alphabetical-asc',
        },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('test')
      expect(filterOptions.value.categories).toEqual(['Testing'])
      expect(filterOptions.value.pricingModels).toEqual(['Free'])
      expect(filterOptions.value.difficultyLevels).toEqual(['Beginner'])
      expect(filterOptions.value.technologies).toEqual(['Vue.js'])
      expect(sortOption.value).toBe('alphabetical-asc')
    })

    it('should handle empty query object', () => {
      mockRoute.value = {
        query: {},
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('')
      expect(filterOptions.value.categories).toEqual([])
      expect(filterOptions.value.pricingModels).toEqual([])
      expect(filterOptions.value.difficultyLevels).toEqual([])
      expect(filterOptions.value.technologies).toEqual([])
    })
  })

  describe('updateUrlParams', () => {
    it('should update URL with search query', () => {
      filterOptions.value.searchQuery = 'test query'

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { q: 'test query' },
      })
    })

    it('should update URL with categories', () => {
      filterOptions.value.categories = ['Testing', 'Development']

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { categories: ['Testing', 'Development'] },
      })
    })

    it('should not include empty categories array in URL', () => {
      filterOptions.value.categories = []

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {},
      })
    })

    it('should update URL with pricing models', () => {
      filterOptions.value.pricingModels = ['Free', 'Paid']

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { pricing: ['Free', 'Paid'] },
      })
    })

    it('should update URL with difficulty levels', () => {
      filterOptions.value.difficultyLevels = ['Beginner', 'Intermediate']

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { difficulty: ['Beginner', 'Intermediate'] },
      })
    })

    it('should update URL with technologies', () => {
      filterOptions.value.technologies = ['Vue.js', 'React']

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { technologies: ['Vue.js', 'React'] },
      })
    })

    it('should update URL with sort option', () => {
      sortOption.value = 'alphabetical-asc'

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { sort: 'alphabetical-asc' },
      })
    })

    it('should not include default sort option in URL', () => {
      sortOption.value = 'popularity-desc'

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {},
      })
    })

    it('should update URL with all parameters', () => {
      filterOptions.value.searchQuery = 'test'
      filterOptions.value.categories = ['Testing']
      filterOptions.value.pricingModels = ['Free']
      filterOptions.value.difficultyLevels = ['Beginner']
      filterOptions.value.technologies = ['Vue.js']
      sortOption.value = 'alphabetical-asc'

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {
          q: 'test',
          categories: ['Testing'],
          pricing: ['Free'],
          difficulty: ['Beginner'],
          technologies: ['Vue.js'],
          sort: 'alphabetical-asc',
        },
      })
    })

    it('should create new array instances to avoid reference issues', () => {
      filterOptions.value.categories = ['Testing']

      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      const params = mockReplace.mock.calls[0][0].query
      expect(params.categories).not.toBe(filterOptions.value.categories)
      expect(params.categories).toEqual(['Testing'])
    })
  })

  describe('edge cases', () => {
    it('should handle null values in arrays when parsing', () => {
      mockRoute.value = {
        query: { categories: [null, 'Testing', null] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.categories).toEqual(['Testing'])
    })

    it('should handle undefined values in query', () => {
      mockRoute.value = {
        query: {
          q: undefined,
          categories: undefined,
          pricing: undefined,
          difficulty: undefined,
          technologies: undefined,
        },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('')
      expect(filterOptions.value.categories).toEqual([])
      expect(filterOptions.value.pricingModels).toEqual([])
      expect(filterOptions.value.difficultyLevels).toEqual([])
      expect(filterOptions.value.technologies).toEqual([])
    })

    it('should handle empty strings in query', () => {
      mockRoute.value = {
        query: { q: '', categories: '' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('')
      expect(filterOptions.value.categories).toEqual([])
    })

    it('should not update URL when filters have empty arrays', () => {
      const { updateUrlParams } = setupUrlSync()
      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {},
      })
    })
  })

  describe('data type handling', () => {
    it('should correctly handle array type for categories', () => {
      mockRoute.value = {
        query: { categories: ['Testing', 'Development'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(Array.isArray(filterOptions.value.categories)).toBe(true)
      expect(filterOptions.value.categories).toHaveLength(2)
    })

    it('should correctly handle array type for pricing', () => {
      mockRoute.value = {
        query: { pricing: ['Free', 'Paid'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(Array.isArray(filterOptions.value.pricingModels)).toBe(true)
      expect(filterOptions.value.pricingModels).toHaveLength(2)
    })

    it('should correctly handle array type for difficulty', () => {
      mockRoute.value = {
        query: { difficulty: ['Beginner', 'Intermediate'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(Array.isArray(filterOptions.value.difficultyLevels)).toBe(true)
      expect(filterOptions.value.difficultyLevels).toHaveLength(2)
    })

    it('should correctly handle array type for technologies', () => {
      mockRoute.value = {
        query: { technologies: ['Vue.js', 'React'] },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(Array.isArray(filterOptions.value.technologies)).toBe(true)
      expect(filterOptions.value.technologies).toHaveLength(2)
    })

    it('should correctly handle string type for categories', () => {
      mockRoute.value = {
        query: { categories: 'Testing' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.categories).toEqual(['Testing'])
    })

    it('should correctly handle string type for search query', () => {
      mockRoute.value = {
        query: { q: 'test query' },
        path: '/search',
      }

      const { parseUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(typeof filterOptions.value.searchQuery).toBe('string')
      expect(filterOptions.value.searchQuery).toBe('test query')
    })
  })

  describe('integration scenarios', () => {
    it('should round-trip parse and update URL parameters', () => {
      const originalQuery = {
        q: 'test',
        categories: ['Testing'],
        pricing: ['Free'],
        difficulty: ['Beginner'],
        technologies: ['Vue.js'],
        sort: 'alphabetical-asc',
      }

      mockRoute.value = {
        query: originalQuery,
        path: '/search',
      }

      const { parseUrlParams, updateUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(filterOptions.value.searchQuery).toBe('test')
      expect(filterOptions.value.categories).toEqual(['Testing'])
      expect(filterOptions.value.pricingModels).toEqual(['Free'])
      expect(filterOptions.value.difficultyLevels).toEqual(['Beginner'])
      expect(filterOptions.value.technologies).toEqual(['Vue.js'])
      expect(sortOption.value).toBe('alphabetical-asc')

      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: originalQuery,
      })
    })

    it('should handle default sort option in round-trip', () => {
      mockRoute.value = {
        query: { q: 'test' },
        path: '/search',
      }

      const { parseUrlParams, updateUrlParams } = setupUrlSync()
      parseUrlParams()

      expect(sortOption.value).toBe('popularity-desc')

      updateUrlParams()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { q: 'test' },
      })
    })
  })
})
