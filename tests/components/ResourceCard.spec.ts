import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '@/components/ResourceCard.vue'

// Mock resource data - using individual props that match ResourceCard component
const mockProps = {
  title: 'Test Resource',
  description: 'This is a test resource description',
  benefits: ['Free tier available', 'Open source', 'Community support'],
  url: 'https://example.com',
  icon: 'test-icon',
  newTab: true,
  buttonLabel: 'Get Free Access',
}

describe('ResourceCard', () => {
  it('renders resource information correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: mockProps,
    })

    expect(wrapper.find('h3').text()).toBe('Test Resource')
    expect(wrapper.find('p').text()).toBe('This is a test resource description')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })

  it('displays button with correct label', () => {
    const wrapper = mount(ResourceCard, {
      props: { ...mockProps, buttonLabel: 'Visit Site' },
    })

    expect(wrapper.find('a').text()).toContain('Visit Site')
  })

  it('opens link in new tab by default', () => {
    const wrapper = mount(ResourceCard, {
      props: mockProps,
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_blank')
  })

  it('opens link in same tab when newTab is false', () => {
    const wrapper = mount(ResourceCard, {
      props: { ...mockProps, newTab: false },
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_self')
  })

  it('renders icon when provided', () => {
    const wrapper = mount(ResourceCard, {
      props: mockProps,
    })

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('test-icon')
  })

  it('does not render icon when not provided', () => {
    const wrapper = mount(ResourceCard, {
      props: { ...mockProps, icon: undefined },
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })
})
