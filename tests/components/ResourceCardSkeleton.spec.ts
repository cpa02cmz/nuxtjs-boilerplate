import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCardSkeleton from '~/components/ResourceCardSkeleton.vue'

describe('ResourceCardSkeleton', () => {
  it('renders the skeleton structure correctly', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check main container
    expect(wrapper.classes()).toContain('bg-white')
    expect(wrapper.classes()).toContain('p-6')
    expect(wrapper.classes()).toContain('rounded-lg')
    expect(wrapper.classes()).toContain('shadow')
    expect(wrapper.classes()).toContain('animate-pulse')

    // Check icon placeholder
    const iconPlaceholder = wrapper.find('.flex-shrink-0 .bg-gray-200')
    expect(iconPlaceholder.exists()).toBe(true)
    expect(iconPlaceholder.classes()).toContain('w-12')
    expect(iconPlaceholder.classes()).toContain('h-12')

    // Check title placeholder
    const titlePlaceholder = wrapper.find('.h-5.bg-gray-200')
    expect(titlePlaceholder.exists()).toBe(true)
    expect(titlePlaceholder.classes()).toContain('w-3/4')
    expect(titlePlaceholder.classes()).toContain('mb-3')

    // Check description placeholders
    const descriptionPlaceholders = wrapper.findAll('.h-4.bg-gray-200')
    expect(descriptionPlaceholders).toHaveLength(2)

    // Check benefits section
    const benefitsSection = wrapper.find('.mt-3.bg-gray-50.p-3.rounded-md')
    expect(benefitsSection.exists()).toBe(true)

    // Check benefits list placeholders
    const benefitPlaceholders = wrapper.findAll('.space-y-2 .h-3.bg-gray-200')
    expect(benefitPlaceholders).toHaveLength(3)

    // Check button placeholder
    const buttonPlaceholder = wrapper.find('.mt-3 .h-8.bg-gray-200')
    expect(buttonPlaceholder.exists()).toBe(true)
    expect(buttonPlaceholder.classes()).toContain('w-32')
  })

  it('has the correct flex layout structure', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check flex container
    const flexContainer = wrapper.find('.flex.items-start')
    expect(flexContainer.exists()).toBe(true)

    // Check icon section
    const iconSection = wrapper.find('.flex-shrink-0.mr-4')
    expect(iconSection.exists()).toBe(true)

    // Check content section
    const contentSection = wrapper.find('.flex-1.min-w-0')
    expect(contentSection.exists()).toBe(true)
  })

  it('has proper spacing classes', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check main container padding
    expect(wrapper.classes()).toContain('p-6')

    // Check icon margin
    const iconSection = wrapper.find('.flex-shrink-0.mr-4')
    expect(iconSection.exists()).toBe(true)

    // Check title margin
    const title = wrapper.find('.h-5.bg-gray-200')
    expect(title.classes()).toContain('mb-3')

    // Check description margins
    const descriptions = wrapper.findAll('.h-4.bg-gray-200')
    expect(descriptions[0].classes()).toContain('mb-2')
    expect(descriptions[1].classes()).toContain('mb-4')

    // Check benefits section margin
    const benefitsSection = wrapper.find('.mt-3.bg-gray-50.p-3.rounded-md')
    expect(benefitsSection.classes()).toContain('mt-3')

    // Check button margin
    const buttonPlaceholder = wrapper.find('.mt-3 .h-8.bg-gray-200')
    expect(buttonPlaceholder.classes()).toContain('mt-3')
  })

  it('has proper rounded corners', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check main container rounded corners
    expect(wrapper.classes()).toContain('rounded-lg')

    // Check icon rounded corners
    const iconPlaceholder = wrapper.find('.flex-shrink-0 .bg-gray-200')
    expect(iconPlaceholder.classes()).toContain('rounded')

    // Check benefits section rounded corners
    const benefitsSection = wrapper.find('.mt-3.bg-gray-50.p-3.rounded-md')
    expect(benefitsSection.classes()).toContain('rounded-md')

    // Check button rounded corners
    const buttonPlaceholder = wrapper.find('.mt-3 .h-8.bg-gray-200.rounded-md')
    expect(buttonPlaceholder.classes()).toContain('rounded-md')
  })

  it('uses appropriate background colors', () => {
    const wrapper = mount(ResourceCardSkeleton)

    // Check main background
    expect(wrapper.classes()).toContain('bg-white')

    // Check placeholder backgrounds
    const placeholders = wrapper.findAll('.bg-gray-200')
    expect(placeholders.length).toBeGreaterThan(0)

    // Check benefits section background
    const benefitsSection = wrapper.find('.mt-3.bg-gray-50.p-3.rounded-md')
    expect(benefitsSection.classes()).toContain('bg-gray-50')
  })
})
