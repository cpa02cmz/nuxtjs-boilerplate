import { describe, it, expect, beforeAll, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CharacterCounter from '../CharacterCounter.vue'

// Mock window.matchMedia for reduced motion tests
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('CharacterCounter', () => {
  const defaultProps = {
    characterCount: 50,
    maxLength: 100,
  }

  it('renders correctly with default props', () => {
    const wrapper = mount(CharacterCounter, {
      props: defaultProps,
      slots: {
        default: '<input type="text" />',
      },
    })

    expect(wrapper.find('.character-counter-wrapper').exists()).toBe(true)
    expect(wrapper.find('.character-counter-ring').exists()).toBe(true)
  })

  it('displays correct remaining count', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 75,
        maxLength: 100,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    const counterText = wrapper.find('.character-counter-ring__text')
    expect(counterText.text()).toBe('25')
  })

  it('shows warning state when near limit', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 85,
        maxLength: 100,
        warningThreshold: 0.8,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    expect(wrapper.classes()).toContain('character-counter--warning')
    expect(
      wrapper.find('.character-counter-ring__text--warning').exists()
    ).toBe(true)
  })

  it('shows error state when over limit', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 105,
        maxLength: 100,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    expect(wrapper.classes()).toContain('character-counter--error')
    expect(wrapper.find('.character-counter-ring__text--error').exists()).toBe(
      true
    )
  })

  it('respects warning threshold', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 60,
        maxLength: 100,
        warningThreshold: 0.5,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    expect(wrapper.classes()).toContain('character-counter--warning')
  })

  it('hides counter when showCounter is false', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        ...defaultProps,
        showCounter: false,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    expect(wrapper.find('.character-counter-ring').exists()).toBe(false)
  })

  it('shows counter with alwaysShow even at 0 characters', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 0,
        maxLength: 100,
        alwaysShow: true,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    const ring = wrapper.find('.character-counter-ring')
    expect(ring.classes()).toContain('character-counter-ring--visible')
  })

  it('applies focused styling when isFocused is true', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        ...defaultProps,
        isFocused: true,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    expect(wrapper.classes()).toContain('character-counter--focused')
    expect(wrapper.find('.character-counter-ring--focused').exists()).toBe(true)
  })

  it('renders with custom ring size', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        ...defaultProps,
        ringSize: 40,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    const svg = wrapper.find('.character-counter-ring__svg')
    expect(svg.attributes('width')).toBe('40')
    expect(svg.attributes('height')).toBe('40')
  })

  it('provides correct slot props', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 90,
        maxLength: 100,
        warningThreshold: 0.8,
      },
      slots: {
        default: `
          <template #default="{ characterCount, isNearLimit, isOverLimit }">
            <input 
              type="text" 
              :data-count="characterCount"
              :data-near="isNearLimit"
              :data-over="isOverLimit"
            />
          </template>
        `,
      },
    })

    const input = wrapper.find('input')
    expect(input.attributes('data-count')).toBe('90')
    expect(input.attributes('data-near')).toBe('true')
    expect(input.attributes('data-over')).toBe('false')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(CharacterCounter, {
      props: defaultProps,
      slots: {
        default: '<input type="text" aria-describedby="char-count" />',
      },
    })

    // Should have screen reader only status element
    const srElement = wrapper.find('.sr-only[role="status"]')
    expect(srElement.exists()).toBe(true)
    expect(srElement.attributes('aria-live')).toBe('polite')
    expect(srElement.attributes('aria-atomic')).toBe('true')
  })

  it('shows negative remaining count when over limit', () => {
    const wrapper = mount(CharacterCounter, {
      props: {
        characterCount: 120,
        maxLength: 100,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    const counterText = wrapper.find('.character-counter-ring__text')
    expect(counterText.text()).toBe('-20')
  })

  it('calculates SVG dimensions correctly', () => {
    const ringSize = 32
    const strokeWidth = 4

    const wrapper = mount(CharacterCounter, {
      props: {
        ...defaultProps,
        ringSize,
        strokeWidth,
      },
      slots: {
        default: '<input type="text" />',
      },
    })

    const svg = wrapper.find('.character-counter-ring__svg')
    expect(svg.attributes('viewBox')).toBe(`0 0 ${ringSize} ${ringSize}`)
  })
})
