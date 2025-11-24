import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ToastNotification from '~/components/ToastNotification.vue'

// Mock setTimeout to control timing in tests
vi.useFakeTimers()

describe('ToastNotification', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  it('renders without toasts initially', () => {
    const wrapper = mount(ToastNotification)

    expect(wrapper.find('.fixed.top-4.right-4').exists()).toBe(true)
    expect(wrapper.findAll('[role="alert"]').length).toBe(0)
  })

  it('shows toast when addToast is called', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Test Title',
      message: 'Test Message',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    const toast = wrapper.find('[role="alert"]')
    expect(toast.exists()).toBe(true)
    expect(toast.text()).toContain('Test Title')
    expect(toast.text()).toContain('Test Message')
  })

  it('renders different icons for different toast types', async () => {
    const wrapper = mount(ToastNotification)

    // Add a success toast
    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Success',
      message: 'Operation successful',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    // Check for success icon (green color)
    const successIcon = wrapper.find('svg.text-green-400')
    expect(successIcon.exists()).toBe(true)

    // Add an error toast
    toastComponent.addToast({
      title: 'Error',
      message: 'Operation failed',
      type: 'error',
    })

    await wrapper.vm.$nextTick()

    // Check for error icon (red color)
    const errorIcon = wrapper.find('svg.text-red-400')
    expect(errorIcon.exists()).toBe(true)

    // Add a warning toast
    toastComponent.addToast({
      title: 'Warning',
      message: 'Warning message',
      type: 'warning',
    })

    await wrapper.vm.$nextTick()

    // Check for warning icon (yellow color)
    const warningIcon = wrapper.find('svg.text-yellow-400')
    expect(warningIcon.exists()).toBe(true)

    // Add an info toast
    toastComponent.addToast({
      title: 'Info',
      message: 'Information',
      type: 'info',
    })

    await wrapper.vm.$nextTick()

    // Check for info icon (blue color)
    const infoIcon = wrapper.find('svg.text-blue-400')
    expect(infoIcon.exists()).toBe(true)
  })

  it('has correct styling classes for toast container', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Test',
      message: 'Test message',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    const toast = wrapper.find('[role="alert"]')
    expect(toast.classes()).toContain('p-4')
    expect(toast.classes()).toContain('rounded-md')
    expect(toast.classes()).toContain('shadow-lg')
    expect(toast.classes()).toContain('flex')
    expect(toast.classes()).toContain('items-start')
    expect(toast.classes()).toContain('bg-white')
    expect(toast.classes()).toContain('border')
    expect(toast.classes()).toContain('border-gray-200')
  })

  it('has correct positioning classes for the main container', () => {
    const wrapper = mount(ToastNotification)

    const mainContainer = wrapper.find('.fixed.top-4.right-4')
    expect(mainContainer.classes()).toContain('fixed')
    expect(mainContainer.classes()).toContain('top-4')
    expect(mainContainer.classes()).toContain('right-4')
    expect(mainContainer.classes()).toContain('z-50')
    expect(mainContainer.classes()).toContain('space-y-2')
    expect(mainContainer.classes()).toContain('w-full')
    expect(mainContainer.classes()).toContain('max-w-sm')
  })

  it('removes toast when close button is clicked', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Test',
      message: 'Test message',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    // Verify toast is shown
    expect(wrapper.findAll('[role="alert"]').length).toBe(1)

    // Click the close button
    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')

    await wrapper.vm.$nextTick()

    // Verify toast is removed
    expect(wrapper.findAll('[role="alert"]').length).toBe(0)
  })

  it('has proper accessibility attributes', async () => {
    const wrapper = mount(ToastNotification)

    // Add an error toast
    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Error',
      message: 'Error message',
      type: 'error',
    })

    await wrapper.vm.$nextTick()

    const errorToast = wrapper.find('[role="alert"]')
    expect(errorToast.attributes('aria-live')).toBe('assertive')

    // Add a success toast
    toastComponent.addToast({
      title: 'Success',
      message: 'Success message',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    const successToast = wrapper.findAll('[role="alert"]')[1]
    expect(successToast.attributes('aria-live')).toBe('polite')
  })

  it('has correct content structure', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Test Title',
      message: 'Test message',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    const toast = wrapper.find('[role="alert"]')

    // Check for icon container
    const iconContainer = toast.find('.flex-shrink-0')
    expect(iconContainer.exists()).toBe(true)

    // Check for content container
    const contentContainer = toast.find('.ml-3.flex-1')
    expect(contentContainer.exists()).toBe(true)

    // Check for title
    const title = contentContainer.find('.text-sm.font-medium.text-gray-900')
    expect(title.text()).toBe('Test Title')

    // Check for message
    const message = contentContainer.find('.mt-1.text-sm.text-gray-500')
    expect(message.text()).toBe('Test message')

    // Check for close button container
    const closeContainer = toast.find('.ml-4.flex.flex-shrink-0')
    expect(closeContainer.exists()).toBe(true)
  })

  it('auto-removes toast after duration', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Auto Remove',
      message: 'This will auto remove',
      type: 'info',
      duration: 1000, // 1 second
    })

    await wrapper.vm.$nextTick()

    // Should have 1 toast initially
    expect(wrapper.findAll('[role="alert"]').length).toBe(1)

    // Advance timers by more than the duration
    vi.advanceTimersByTime(1100)

    await wrapper.vm.$nextTick()

    // Toast should be removed
    expect(wrapper.findAll('[role="alert"]').length).toBe(0)
  })

  it('does not auto-remove toast if duration is 0', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'No Auto Remove',
      message: 'This will not auto remove',
      type: 'info',
      duration: 0,
    })

    await wrapper.vm.$nextTick()

    // Should have 1 toast
    expect(wrapper.findAll('[role="alert"]').length).toBe(1)

    // Advance timers by a long time
    vi.advanceTimersByTime(10000)

    await wrapper.vm.$nextTick()

    // Toast should still be there
    expect(wrapper.findAll('[role="alert"]').length).toBe(1)
  })

  it('has proper close button styling and functionality', async () => {
    const wrapper = mount(ToastNotification)

    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      title: 'Test',
      message: 'Test message',
      type: 'success',
    })

    await wrapper.vm.$nextTick()

    const closeButton = wrapper.find('button')

    // Check close button classes
    expect(closeButton.classes()).toContain('inline-flex')
    expect(closeButton.classes()).toContain('rounded-md')
    expect(closeButton.classes()).toContain('text-gray-400')
    expect(closeButton.classes()).toContain('hover:text-gray-500')
    expect(closeButton.classes()).toContain('focus:outline-none')
    expect(closeButton.classes()).toContain('focus:ring-2')
    expect(closeButton.classes()).toContain('focus:ring-blue-500')
    expect(closeButton.classes()).toContain('focus:ring-offset-2')

    // Check for screen reader text
    const srText = closeButton.find('.sr-only')
    expect(srText.text()).toBe('Close')
  })
})
