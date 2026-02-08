import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with default props', () => {
    const wrapper = mount(LoadingSpinner)

    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner__circular').exists()).toBe(true)
    expect(wrapper.find('.sr-only').text()).toBe('Loading')
  })

  it('renders with custom label', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { label: 'Custom Loading Message' },
    })

    expect(wrapper.find('.loading-spinner__label').text()).toBe(
      'Custom Loading Message'
    )
  })

  it('renders with different sizes', () => {
    const small = mount(LoadingSpinner, { props: { size: 'small' } })
    const medium = mount(LoadingSpinner, { props: { size: 'medium' } })
    const large = mount(LoadingSpinner, { props: { size: 'large' } })

    expect(small.find('.loading-spinner--small').exists()).toBe(true)
    expect(medium.find('.loading-spinner--small').exists()).toBe(false)
    expect(medium.find('.loading-spinner--large').exists()).toBe(false)
    expect(large.find('.loading-spinner--large').exists()).toBe(true)
  })

  it('has correct accessibility attributes', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { label: 'Searching resources' },
    })

    const spinner = wrapper.find('[role="status"]')
    expect(spinner.exists()).toBe(true)
    expect(spinner.attributes('aria-label')).toBe('Searching resources')
  })

  it('announces loading state changes to screen readers', async () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        label: 'Search',
        state: null,
      },
    })

    // Initially no announcement
    const statusRegion = wrapper.find('[aria-live="polite"]')
    expect(statusRegion.exists()).toBe(true)
    expect(statusRegion.text()).toBe('')

    // Change to loading state
    await wrapper.setProps({ state: 'loading' })
    await nextTick()
    expect(statusRegion.text()).toContain('in progress')

    // Change to complete state
    await wrapper.setProps({ state: 'complete' })
    await nextTick()
    expect(statusRegion.text()).toContain('complete')

    // Change to error state
    await wrapper.setProps({ state: 'error' })
    await nextTick()
    expect(statusRegion.text()).toContain('failed')
  })

  it('uses custom message when provided', async () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        state: 'loading',
        customMessage: 'Custom announcement message',
      },
    })

    await nextTick()
    const statusRegion = wrapper.find('[aria-live="polite"]')
    expect(statusRegion.text()).toBe('Custom announcement message')
  })

  it('generates unique IDs for each instance', () => {
    const wrapper1 = mount(LoadingSpinner)
    const wrapper2 = mount(LoadingSpinner)

    const id1 = wrapper1.find('[aria-live="polite"]').attributes('id')
    const id2 = wrapper2.find('[aria-live="polite"]').attributes('id')

    expect(id1).not.toBe(id2)
    expect(id1).toMatch(/^loading-status-spinner-/)
    expect(id2).toMatch(/^loading-status-spinner-/)
  })

  it('announces without label', async () => {
    const wrapper = mount(LoadingSpinner, {
      props: { state: 'loading' },
    })

    await nextTick()
    const statusRegion = wrapper.find('[aria-live="polite"]')
    expect(statusRegion.text()).toBe('Loading in progress')

    await wrapper.setProps({ state: 'complete' })
    await nextTick()
    expect(statusRegion.text()).toBe('Loading complete')
  })
})
