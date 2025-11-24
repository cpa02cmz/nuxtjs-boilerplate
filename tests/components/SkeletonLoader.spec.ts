import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import SkeletonLoader from '~/components/SkeletonLoader.vue'

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    const wrapper = mount(SkeletonLoader)

    expect(wrapper.classes()).toContain('animate-pulse')
    expect(wrapper.classes()).toContain('bg-gray-200')
    expect(wrapper.classes()).toContain('h-6') // default medium size
    expect(wrapper.classes()).toContain('rounded')
  })

  it('applies correct height classes for different sizes', () => {
    // Test small size
    const smallWrapper = mount(SkeletonLoader, {
      props: { size: 'small' },
    })
    expect(smallWrapper.classes()).toContain('h-4')
    expect(smallWrapper.classes()).not.toContain('h-6')
    expect(smallWrapper.classes()).not.toContain('h-8')

    // Test medium size (default)
    const mediumWrapper = mount(SkeletonLoader, {
      props: { size: 'medium' },
    })
    expect(mediumWrapper.classes()).toContain('h-6')
    expect(mediumWrapper.classes()).not.toContain('h-4')
    expect(mediumWrapper.classes()).not.toContain('h-8')

    // Test large size
    const largeWrapper = mount(SkeletonLoader, {
      props: { size: 'large' },
    })
    expect(largeWrapper.classes()).toContain('h-8')
    expect(largeWrapper.classes()).not.toContain('h-4')
    expect(largeWrapper.classes()).not.toContain('h-6')
  })

  it('applies correct width classes for different width options', () => {
    // Test full width
    const fullWrapper = mount(SkeletonLoader, {
      props: { width: 'full' },
    })
    expect(fullWrapper.classes()).toContain('w-full')

    // Test half width
    const halfWrapper = mount(SkeletonLoader, {
      props: { width: 'half' },
    })
    expect(halfWrapper.classes()).toContain('w-1/2')

    // Test quarter width
    const quarterWrapper = mount(SkeletonLoader, {
      props: { width: 'quarter' },
    })
    expect(quarterWrapper.classes()).toContain('w-1/4')

    // Test auto width (default)
    const autoWrapper = mount(SkeletonLoader, {
      props: { width: 'auto' },
    })
    expect(autoWrapper.classes()).not.toContain('w-full')
    expect(autoWrapper.classes()).not.toContain('w-1/2')
    expect(autoWrapper.classes()).not.toContain('w-1/4')
  })

  it('applies rounded-full class when rounded prop is true', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { rounded: true },
    })

    expect(wrapper.classes()).toContain('rounded-full')
    expect(wrapper.classes()).toContain('rounded')
  })

  it('does not apply rounded-full class when rounded prop is false', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { rounded: false },
    })

    expect(wrapper.classes()).toContain('rounded')
    expect(wrapper.classes()).not.toContain('rounded-full')
  })

  it('applies custom width style when customWidth is provided', () => {
    const customWidth = '200px'
    const wrapper = mount(SkeletonLoader, {
      props: { customWidth },
    })

    expect(wrapper.attributes('style')).toContain(customWidth)
  })

  it('does not apply width class when customWidth is provided', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { width: 'full', customWidth: '200px' },
    })

    expect(wrapper.classes()).not.toContain('w-full')
    expect(wrapper.attributes('style')).toContain('200px')
  })

  it('does not apply width class when customWidth is provided with other width options', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { width: 'half', customWidth: '150px' },
    })

    expect(wrapper.classes()).not.toContain('w-1/2')
    expect(wrapper.attributes('style')).toContain('150px')
  })

  it('has correct base classes that are always applied', () => {
    const wrapper = mount(SkeletonLoader)

    expect(wrapper.classes()).toContain('animate-pulse')
    expect(wrapper.classes()).toContain('bg-gray-200')
    expect(wrapper.classes()).toContain('rounded')
  })

  it('uses default size when no size prop is provided', () => {
    const wrapper = mount(SkeletonLoader)

    expect(wrapper.classes()).toContain('h-6') // medium is default
    expect(wrapper.classes()).not.toContain('h-4')
    expect(wrapper.classes()).not.toContain('h-8')
  })

  it('uses default width when no width prop is provided', () => {
    const wrapper = mount(SkeletonLoader)

    expect(wrapper.classes()).not.toContain('w-full')
    expect(wrapper.classes()).not.toContain('w-1/2')
    expect(wrapper.classes()).not.toContain('w-1/4')
  })

  it('has proper structure with div element', () => {
    const wrapper = mount(SkeletonLoader)

    expect(wrapper.element.tagName).toBe('DIV')
  })
})
