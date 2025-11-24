import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'

// Mock the useNuxtApp composable
const mockPWA = {
  showInstallPrompt: false,
  installPWA: vi.fn(),
}

vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useNuxtApp: () => ({
      pwa: mockPWA,
    }),
  }
})

describe('PWAInstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock values
    mockPWA.showInstallPrompt = false
  })

  it('does not show when showInstallPrompt is false', () => {
    mockPWA.showInstallPrompt = false

    const wrapper = mount(PWAInstallPrompt)

    expect(wrapper.find('.fixed.bottom-4').exists()).toBe(false)
  })

  it('shows when showInstallPrompt is true', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    expect(wrapper.find('.fixed.bottom-4').exists()).toBe(true)
  })

  it('has correct styling classes when visible', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    const prompt = wrapper.find('.fixed.bottom-4')
    expect(prompt.exists()).toBe(true)

    // Check positioning and styling classes
    expect(prompt.classes()).toContain('fixed')
    expect(prompt.classes()).toContain('bottom-4')
    expect(prompt.classes()).toContain('left-1/2')
    expect(prompt.classes()).toContain('transform')
    expect(prompt.classes()).toContain('-translate-x-1/2')
    expect(prompt.classes()).toContain('bg-white')
    expect(prompt.classes()).toContain('shadow-lg')
    expect(prompt.classes()).toContain('rounded-lg')
    expect(prompt.classes()).toContain('p-4')
    expect(prompt.classes()).toContain('border')
    expect(prompt.classes()).toContain('border-gray-200')
    expect(prompt.classes()).toContain('z-50')
    expect(prompt.classes()).toContain('max-w-sm')
    expect(prompt.classes()).toContain('w-full')
    expect(prompt.classes()).toContain('mx-4')
  })

  it('has correct content structure', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    // Check the main flex container
    const flexContainer = wrapper.find('.flex.items-center.justify-between')
    expect(flexContainer.exists()).toBe(true)

    // Check the icon container
    const iconContainer = wrapper.find('.bg-gray-100.rounded-lg.p-2')
    expect(iconContainer.exists()).toBe(true)

    // Check the icon
    const icon = wrapper.find('svg.h-6.w-6.text-gray-700')
    expect(icon.exists()).toBe(true)

    // Check the text content
    expect(wrapper.find('h3.font-medium.text-gray-900').text()).toBe(
      'Install App'
    )
    expect(wrapper.find('p.text-sm.text-gray-500').text()).toBe(
      'Add to your home screen'
    )
  })

  it('has correct button structure', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    // Check both buttons exist
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)

    // Check "Not now" button
    const notNowButton = wrapper.find('.px-3.py-1.text-sm.text-gray-600')
    expect(notNowButton.exists()).toBe(true)
    expect(notNowButton.text()).toBe('Not now')

    // Check "Install" button
    const installButton = wrapper.find(
      '.px-3.py-1.bg-blue-600.text-white.text-sm.rounded-md'
    )
    expect(installButton.exists()).toBe(true)
    expect(installButton.text()).toBe('Install')
  })

  it('calls installPWA when install button is clicked', async () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    const installButton = wrapper.find('.bg-blue-600')
    await installButton.trigger('click')

    expect(mockPWA.installPWA).toHaveBeenCalledTimes(1)
  })

  it('does not call installPWA when not now button is clicked', async () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    const notNowButton = wrapper.find('.text-gray-600')
    await notNowButton.trigger('click')

    expect(mockPWA.installPWA).not.toHaveBeenCalled()
  })

  it('has proper flex layout for content', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    // Check the content section with icon and text
    const contentSection = wrapper.find('.flex.items-center.space-x-3')
    expect(contentSection.exists()).toBe(true)

    // Check the button section
    const buttonSection = wrapper.find('.flex.space-x-2')
    expect(buttonSection.exists()).toBe(true)
  })

  it('has correct hover states for buttons', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    // Check "Not now" button hover class
    const notNowButton = wrapper.find('.text-gray-600.hover:text-gray-800')
    expect(notNowButton.exists()).toBe(true)

    // Check "Install" button hover class
    const installButton = wrapper.find('.bg-blue-600.hover:bg-blue-700')
    expect(installButton.exists()).toBe(true)
  })

  it('has proper focus states for install button', () => {
    mockPWA.showInstallPrompt = true

    const wrapper = mount(PWAInstallPrompt)

    // Check focus classes for install button
    const installButton = wrapper.find(
      '.focus:outline-none.focus:ring-2.focus:ring-blue-500.focus:ring-offset-2'
    )
    expect(installButton.exists()).toBe(true)
  })
})
