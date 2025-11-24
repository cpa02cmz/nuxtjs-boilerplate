import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBoundary from '~/components/ErrorBoundary.vue'

// Mock the navigateTo function
const mockNavigateTo = vi.fn()

vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    navigateTo: mockNavigateTo,
  }
})

// Mock the errorLogger
vi.mock('~/utils/errorLogger', () => ({
  logError: vi.fn(),
}))

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders slot content when no error occurs', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    expect(wrapper.find('.error-boundary').exists()).toBe(false)
    expect(wrapper.text()).toContain('Child content')
  })

  it('shows error UI when an error is captured', () => {
    const error = new Error('Test error')
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.find('.error-title').text()).toBe('Something went wrong')
    expect(wrapper.find('.error-message').text()).toBe('Test error')
  })

  it('shows error message when error has no message', () => {
    const error = { message: undefined }
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error as any

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe(
      'An unexpected error occurred'
    )
  })

  it('shows error stack in development mode', () => {
    // Mock process.dev to be true
    const originalDev = (global as any).process?.dev
    ;(global as any).process = { dev: true }

    const error = new Error('Test error')
    error.stack = 'Error: Test error\n  at TestComponent.vue:10:5'
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error

    const detailsElement = wrapper.find('details')
    expect(detailsElement.exists()).toBe(true)
    expect(detailsElement.text()).toContain('Show Error Details')

    // Restore original value
    if (originalDev !== undefined) {
      ;(global as any).process = { dev: originalDev }
    } else {
      delete (global as any).process
    }
  })

  it('hides error stack in production mode', () => {
    // Mock process.dev to be false
    const originalDev = (global as any).process?.dev
    ;(global as any).process = { dev: false }

    const error = new Error('Test error')
    error.stack = 'Error: Test error\n  at TestComponent.vue:10:5'
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error

    expect(wrapper.find('details').exists()).toBe(false)

    // Restore original value
    if (originalDev !== undefined) {
      ;(global as any).process = { dev: originalDev }
    } else {
      delete (global as any).process
    }
  })

  it('emits error event when error occurs', async () => {
    const error = new Error('Test error')
    const info = { componentStack: 'TestComponent' }
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Call the throwError method to simulate error capture
    wrapper.vm.throwError(error, info)

    expect(wrapper.emitted('error')).toBeTruthy()
    const emitted = wrapper.emitted('error')
    expect(emitted?.[0]).toEqual([error, info])
  })

  it('handles retry action correctly', async () => {
    const error = new Error('Test error')
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error

    // Click the retry button
    const retryButton = wrapper.find('.retry-button')
    await retryButton.trigger('click')

    // Check that retrying is set to true during the action
    expect(wrapper.vm.retrying).toBe(false) // Should be false after the action completes

    // The error should be reset
    expect(wrapper.vm.error).toBeNull()
  })

  it('shows loading state during retry', async () => {
    const error = new Error('Test error')
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error

    // Mock the resetError method to simulate async behavior
    const originalResetError = wrapper.vm.resetError
    wrapper.vm.resetError = () => {
      wrapper.vm.retrying = true
    }

    // Click the retry button
    const retryButton = wrapper.find('.retry-button')
    await retryButton.trigger('click')

    // Check that retrying state is properly managed
    expect(wrapper.vm.retrying).toBe(true)

    // Restore original method
    wrapper.vm.resetError = originalResetError
  })

  it('navigates home when go home button is clicked', async () => {
    const error = new Error('Test error')
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>',
      },
    })

    // Simulate error capture by directly setting the error
    wrapper.vm.error = error

    // Click the go home button
    const homeButton = wrapper.find('.home-button')
    await homeButton.trigger('click')

    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })
})
