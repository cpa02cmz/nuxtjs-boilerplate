import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, watch } from 'vue'
import SearchSuggestions from '~/components/SearchSuggestions.vue'

describe('SearchSuggestions', () => {
  const mockSuggestions = [
    {
      id: '1',
      title: 'Test Suggestion 1',
      description: 'Test description 1',
      url: 'https://example.com/1',
    },
    {
      id: '2',
      title: 'Test Suggestion 2',
      description: 'Test description 2',
      url: 'https://example.com/2',
    },
  ]

  const mockHistory = ['test query 1', 'test query 2']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not show when both suggestions and history are empty', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: [],
        searchHistory: [],
        visible: true,
      },
    })

    expect(wrapper.find('.absolute.z-10').exists()).toBe(false)
  })

  it('shows when suggestions are provided', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: [],
        visible: true,
      },
    })

    expect(wrapper.find('.absolute.z-10').exists()).toBe(true)
  })

  it('shows when search history is provided', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: [],
        searchHistory: mockHistory,
        visible: true,
      },
    })

    expect(wrapper.find('.absolute.z-10').exists()).toBe(true)
  })

  it('has correct container classes', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: [],
        visible: true,
      },
    })

    const container = wrapper.find('.absolute.z-10')
    expect(container.exists()).toBe(true)
    expect(container.attributes('role')).toBe('listbox')
    expect(container.attributes('aria-label')).toBe('Search suggestions')

    expect(container.classes()).toContain('absolute')
    expect(container.classes()).toContain('z-10')
    expect(container.classes()).toContain('mt-1')
    expect(container.classes()).toContain('w-full')
    expect(container.classes()).toContain('bg-white')
    expect(container.classes()).toContain('shadow-lg')
    expect(container.classes()).toContain('rounded-md')
    expect(container.classes()).toContain('py-1')
    expect(container.classes()).toContain('max-h-96')
    expect(container.classes()).toContain('overflow-auto')
    expect(container.classes()).toContain('border')
    expect(container.classes()).toContain('border-gray-200')
  })

  it('renders search history section when history is provided', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: [],
        searchHistory: mockHistory,
        visible: true,
      },
    })

    // Check history header
    const historyHeader = wrapper.find('.text-xs.font-semibold.text-gray-500')
    expect(historyHeader.exists()).toBe(true)
    expect(historyHeader.text()).toBe('Recent Searches')

    // Check history items
    const historyItems = wrapper.findAll('li[role="option"]')
    expect(historyItems).toHaveLength(2)

    historyItems.forEach((item, index) => {
      expect(item.text()).toContain(mockHistory[index])
    })
  })

  it('renders search suggestions section when suggestions are provided', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: [],
        visible: true,
      },
    })

    // Check suggestions header
    const suggestionsHeader = wrapper.find(
      '.text-xs.font-semibold.text-gray-500'
    )
    expect(suggestionsHeader.exists()).toBe(true)
    expect(suggestionsHeader.text()).toBe('Suggestions')

    // Check suggestion items
    const suggestionItems = wrapper.findAll('li[role="option"]')
    expect(suggestionItems).toHaveLength(2)

    suggestionItems.forEach((item, index) => {
      expect(item.text()).toContain(mockSuggestions[index].title)
      expect(item.text()).toContain(mockSuggestions[index].description)
    })
  })

  it('renders both history and suggestions sections when both are provided', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: mockHistory,
        visible: true,
      },
    })

    // Check both headers exist
    const headers = wrapper.findAll('.text-xs.font-semibold.text-gray-500')
    expect(headers).toHaveLength(2)
    expect(headers[0].text()).toBe('Recent Searches')
    expect(headers[1].text()).toBe('Suggestions')

    // Check for the separator between history and suggestions
    const separator = wrapper.find('.border-t.border-gray-200.my-1')
    expect(separator.exists()).toBe(true)

    // Check total items (2 history + 2 suggestions)
    const allItems = wrapper.findAll('li[role="option"]')
    expect(allItems).toHaveLength(4)
  })

  it('emits select-history event when history item is clicked', async () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: [],
        searchHistory: mockHistory,
        visible: true,
      },
    })

    const historyItem = wrapper.find('li[role="option"]')
    await historyItem.trigger('click')

    expect(wrapper.emitted('select-history')).toBeTruthy()
    expect(wrapper.emitted('select-history')![0]).toEqual([mockHistory[0]])
  })

  it('emits select-suggestion event when suggestion is clicked', async () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: [],
        visible: true,
      },
    })

    const suggestionItem = wrapper.find('li[role="option"]')
    await suggestionItem.trigger('click')

    expect(wrapper.emitted('select-suggestion')).toBeTruthy()
    expect(wrapper.emitted('select-suggestion')![0]).toEqual([
      mockSuggestions[0],
    ])
  })

  it('emits clear-history event when clear button is clicked', async () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: [],
        searchHistory: mockHistory,
        visible: true,
      },
    })

    const clearButton = wrapper.find('button')
    await clearButton.trigger('click')

    expect(wrapper.emitted('clear-history')).toBeTruthy()
  })

  it('shows clear history button only when history exists', () => {
    // With history
    const wrapperWithHistory = mount(SearchSuggestions, {
      props: {
        suggestions: [],
        searchHistory: mockHistory,
        visible: true,
      },
    })
    expect(wrapperWithHistory.find('button').exists()).toBe(true)

    // Without history
    const wrapperWithoutHistory = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: [],
        visible: true,
      },
    })
    expect(wrapperWithoutHistory.find('button').exists()).toBe(false)
  })

  it('has proper icons for history and suggestion items', () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: mockHistory,
        visible: true,
      },
    })

    // Check history icon (clock icon)
    const historyIcons = wrapper.findAll('svg.w-4.h-4.mr-2.text-gray-400')
    expect(historyIcons.length).toBeGreaterThanOrEqual(2) // At least 2 icons

    // The first icon should be for history (clock icon has M12 8v4l3 3 path)
    const firstIcon = historyIcons[0]
    expect(firstIcon.attributes('viewBox')).toBe('0 0 24 24')
  })

  it('handles keyboard navigation events', async () => {
    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: mockSuggestions,
        searchHistory: mockHistory,
        visible: true,
      },
    })

    // Test arrow down
    const container = wrapper.find('.absolute.z-10')
    await container.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')![0]).toEqual(['down'])

    // Test arrow up
    await container.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('navigate')![1]).toEqual(['up'])

    // Test enter key
    await container.trigger('keydown', { key: 'Enter' })

    // Test escape key
    await container.trigger('keydown', { key: 'Escape' })
  })

  it('has proper truncation for long text', () => {
    const longSuggestions = [
      {
        id: '1',
        title: 'This is a very long title that should be truncated',
        description:
          'This is a very long description that should also be truncated',
        url: 'https://example.com',
      },
    ]

    const wrapper = mount(SearchSuggestions, {
      props: {
        suggestions: longSuggestions,
        searchHistory: [],
        visible: true,
      },
    })

    const titleElement = wrapper.find('span.font-medium.text-gray-900.truncate')
    expect(titleElement.classes()).toContain('truncate')

    const descriptionElement = wrapper.find(
      'span.text-xs.text-gray-500.truncate'
    )
    expect(descriptionElement.classes()).toContain('truncate')
  })
})
