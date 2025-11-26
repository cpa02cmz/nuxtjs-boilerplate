import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceCard from '../ResourceCard.vue'

// Mock NuxtLink globally to avoid issues with Nuxt app instance
const mockNuxtLink = {
  name: 'NuxtLink',
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

// Mock SocialShare component
const mockSocialShare = {
  name: 'SocialShare',
  template: '<div class="social-share">Social Share</div>',
  props: ['title', 'description', 'url', 'resourceType'],
}

describe('ResourceCard', () => {
  const defaultProps = {
    title: 'Test Resource',
    description: 'Test description',
    benefits: ['Benefit 1', 'Benefit 2'],
    url: 'https://example.com',
  }

  it('renders correctly with required props', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        category: 'Test Category', // Added required prop
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    expect(wrapper.find('h3').text()).toContain('Test Resource')
    expect(wrapper.find('p').text()).toContain('Test description')
    expect(wrapper.text()).toContain('Benefit 1')
    expect(wrapper.text()).toContain('Benefit 2')
  })

  it('renders button with correct label', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        buttonLabel: 'Custom Button',
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    expect(wrapper.text()).toContain('Custom Button')
  })

  it('opens link in new tab by default', () => {
    const wrapper = mount(ResourceCard, {
      props: defaultProps,
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_blank')
  })

  it('opens link in same tab when newTab is false', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        newTab: false,
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_self')
  })

  it('sanitizes XSS attempts in highlighted title', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        highlightedTitle: 'Test Resource <script>alert("XSS")</script>',
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    // The script tag should be removed, leaving only the text
    const titleElement = wrapper.find('h3')
    expect(titleElement.html()).not.toContain('script')
    expect(titleElement.text()).toContain('Test Resource')
  })

  it('sanitizes XSS attempts in highlighted description', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        highlightedDescription:
          'Test description <img src=x onerror=alert("XSS")>',
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    // The img tag with the event handler should be removed
    const descriptionElement = wrapper.find('p')
    expect(descriptionElement.html()).not.toContain('img')
    expect(descriptionElement.html()).not.toContain('onerror')
    expect(descriptionElement.text()).toContain('Test description')
  })

  it('handles complex XSS attempts in highlighted content', () => {
    const maliciousContent =
      'Test <script>document.location="http://evil.com"</script> content <iframe src="javascript:alert(1)"></iframe>'

    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        category: 'Test Category', // Added required prop
        highlightedTitle: maliciousContent,
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const titleElement = wrapper.find('h3')
    expect(titleElement.html()).not.toContain('script')
    expect(titleElement.html()).not.toContain('iframe')
    expect(titleElement.html()).not.toContain('javascript:')
    expect(titleElement.text()).toContain('Test content')
  })

  it('handles advanced XSS attempts with event handlers', () => {
    const maliciousContent =
      'Test <img src="x" onerror="alert(1)"> content <div onclick="javascript:alert(1)">click me</div>'

    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        category: 'Test Category', // Added required prop
        highlightedTitle: maliciousContent,
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const titleElement = wrapper.find('h3')
    expect(titleElement.html()).not.toContain('onerror')
    expect(titleElement.html()).not.toContain('onclick')
    expect(titleElement.html()).not.toContain('javascript:')
    expect(titleElement.text()).toContain('Test content click me')
  })

  it('handles CSS expression XSS attempts', () => {
    const maliciousContent = 'Test style="color: expression(alert(1))" content'

    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        category: 'Test Category', // Added required prop
        highlightedTitle: maliciousContent,
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const titleElement = wrapper.find('h3')
    expect(titleElement.html()).not.toContain('expression(')
    expect(titleElement.text()).toContain('Test style=')
  })

  it('handles multi-vector XSS attempts', () => {
    const maliciousContent =
      '<svg onload=alert(1)> <img src=x onerror=alert(2)> <a href="javascript:alert(3)">link</a>'

    const wrapper = mount(ResourceCard, {
      props: {
        ...defaultProps,
        category: 'Test Category', // Added required prop
        highlightedTitle: maliciousContent,
      },
      global: {
        components: {
          NuxtLink: mockNuxtLink,
          SocialShare: mockSocialShare,
        },
      },
    })

    const titleElement = wrapper.find('h3')
    expect(titleElement.html()).not.toContain('svg')
    expect(titleElement.html()).not.toContain('onload')
    expect(titleElement.html()).not.toContain('onerror')
    expect(titleElement.html()).not.toContain('javascript:')
    expect(titleElement.text()).toContain('link')
  })
})
