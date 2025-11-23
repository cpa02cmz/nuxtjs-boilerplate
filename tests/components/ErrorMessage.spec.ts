import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '~/components/ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('renders error message correctly', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Test error message',
        showRetry: false,
      },
    })

    expect(wrapper.text()).toContain('Test error message')
    expect(wrapper.find('button').exists()).toBe(false) // No retry button when showRetry is false
  })

  it('shows retry button when showRetry is true', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Test error message',
        showRetry: true,
      },
    })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Try Again')
  })

  it('emits retry event when retry button is clicked', async () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Test error message',
        showRetry: true,
      },
    })

    const retryButton = wrapper.find('button')
    await retryButton.trigger('click')

    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(ErrorMessage, {
      props: {
        message: 'Test error message',
        showRetry: true,
      },
    })

    expect(wrapper.attributes('role')).toBe('alert')
    expect(wrapper.attributes('aria-live')).toBe('assertive')
  })
})
