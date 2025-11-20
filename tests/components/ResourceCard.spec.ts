import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '@/components/ResourceCard.vue'

// Mock resource data
const mockResource = {
  id: '1',
  title: 'Test Resource',
  description: 'This is a test resource description',
  url: 'https://example.com',
  category: {
    id: 'test-category',
    name: 'Test Category',
    slug: 'test-category',
    icon: 'test-icon',
  },
  tags: ['test', 'resource'],
  featured: false,
}

describe('ResourceCard', () => {
  it('renders resource information correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    expect(wrapper.find('h3').text()).toBe('Test Resource')
    expect(wrapper.find('p').text()).toBe('This is a test resource description')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
  })

  it('displays featured badge when resource is featured', () => {
    const featuredResource = { ...mockResource, featured: true }
    const wrapper = mount(ResourceCard, {
      props: { resource: featuredResource },
    })

    expect(wrapper.find('.featured-badge').exists()).toBe(true)
  })

  it('does not display featured badge when resource is not featured', () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    expect(wrapper.find('.featured-badge').exists()).toBe(false)
  })

  it('emits visit event when link is clicked', async () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    await wrapper.find('a').trigger('click')

    expect(wrapper.emitted('visit')).toBeTruthy()
    expect(wrapper.emitted('visit')[0]).toEqual([mockResource])
  })

  it('displays category name correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    expect(wrapper.find('.category').text()).toBe('Test Category')
  })

  it('renders tags correctly', () => {
    const wrapper = mount(ResourceCard, {
      props: { resource: mockResource },
    })

    const tags = wrapper.findAll('.tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('test')
    expect(tags[1].text()).toBe('resource')
  })
})
