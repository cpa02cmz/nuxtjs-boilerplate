import { describe, it, expect, vi, beforeEach } from 'vitest'
import { performQualityCheck, checkForDuplicates } from '~/utils/moderation'

describe('Moderation System', () => {
  describe('performQualityCheck', () => {
    it('should return valid result for complete resource', () => {
      const resource = {
        title: 'Test Resource',
        description: 'This is a test resource',
        url: 'https://example.com',
        category: 'Development',
      }

      const result = performQualityCheck(resource)

      expect(result.isValid).toBe(true)
      expect(result.score).toBeGreaterThan(70) // Should have high score
      expect(result.issues).toHaveLength(0)
    })

    it('should detect missing required fields', () => {
      const resource = {
        title: '', // Missing title
        description: 'This is a test resource',
        url: 'https://example.com',
        category: 'Development',
      }

      const result = performQualityCheck(resource)

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Title is missing')
      expect(result.score).toBeLessThan(75)
    })

    it('should detect invalid URLs', () => {
      const resource = {
        title: 'Test Resource',
        description: 'This is a test resource',
        url: 'invalid-url', // Invalid URL
        category: 'Development',
      }

      const result = performQualityCheck(resource)

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('URL is invalid')
    })

    it('should detect spam keywords', () => {
      const resource = {
        title: 'Buy now!',
        description: 'Limited time offer, click here',
        url: 'https://example.com',
        category: 'Development',
      }

      const result = performQualityCheck(resource)

      expect(result.isValid).toBe(false)
      expect(result.issues.some(issue => issue.includes('spam'))).toBe(true)
    })

    it('should return appropriate recommendations', () => {
      const resource = {
        title: 'Short',
        description: 'Brief',
        url: 'https://example.com',
        category: 'Development',
      }

      const result = performQualityCheck(resource)

      expect(result.recommendations).toBeDefined()
      expect(result.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('checkForDuplicates', () => {
    it('should detect exact duplicate titles', () => {
      const resource = {
        title: 'Test Resource',
      }

      const existingResources = [
        {
          id: '1',
          title: 'Test Resource',
          description: 'A test resource',
          url: 'https://example.com',
          category: 'Development',
          status: 'approved',
          dateAdded: new Date().toISOString(),
          popularity: 5,
        },
      ]

      const isDuplicate = checkForDuplicates(resource, existingResources)

      expect(isDuplicate).toBe(true)
    })

    it('should detect similar titles', () => {
      const resource = {
        title: 'Test Resource',
      }

      const existingResources = [
        {
          id: '1',
          title: 'Test Resource!',
          description: 'A test resource',
          url: 'https://example.com',
          category: 'Development',
          status: 'approved',
          dateAdded: new Date().toISOString(),
          popularity: 5,
        },
      ]

      const isDuplicate = checkForDuplicates(resource, existingResources)

      expect(isDuplicate).toBe(true) // Similar titles should be flagged
    })

    it('should return false for non-duplicates', () => {
      const resource = {
        title: 'Unique Resource',
      }

      const existingResources = [
        {
          id: '1',
          title: 'Different Resource',
          description: 'A test resource',
          url: 'https://example.com',
          category: 'Development',
          status: 'approved',
          dateAdded: new Date().toISOString(),
          popularity: 5,
        },
      ]

      const isDuplicate = checkForDuplicates(resource, existingResources)

      expect(isDuplicate).toBe(false)
    })
  })
})
