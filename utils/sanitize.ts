import DOMPurify from 'dompurify'
import { securityConfig } from '~/configs/security.config'
import { themeConfig } from '~/configs/theme.config'

/**
 * Sanitizes content to prevent XSS attacks using multiple layers of protection
 * @param content - The content to sanitize
 * @returns Sanitized content safe for HTML rendering
 */
export const sanitizeForXSS = (content: string): string => {
  if (!content) return content

  const { sanitization } = securityConfig

  // First layer: Preprocessing to remove dangerous content
  let preprocessed = content

  // Build regex patterns from configurable forbidden tags
  const dangerousTagsPattern = sanitization.forbiddenContentTags.join('|')

  // Remove script tags and their content while preserving surrounding whitespace properly
  // Match <script>content</script> and replace with single space to avoid double spaces
  preprocessed = preprocessed.replace(
    new RegExp(
      `(\\s*)<\\s*script[^>]*>[\\s\\S]*?<\\s*\\/\\s*script\\s*>(\\s*)`,
      'gi'
    ),
    '$1'
  )
  preprocessed = preprocessed.replace(/<\s*script[^>]*\/?\s*>/gi, '')

  // Remove other dangerous tags that might have been missed
  // For paired tags, replace with single space to avoid double spaces
  preprocessed = preprocessed.replace(
    new RegExp(
      `(\\s*)<\\s*(${dangerousTagsPattern})[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>(\\s*)`,
      'gi'
    ),
    '$1'
  )
  // For self-closing tags, replace with single space
  preprocessed = preprocessed.replace(
    new RegExp(
      `(\\s*)<\\s*(${dangerousTagsPattern})[^>]*\\/?\\s*>(\\s*)`,
      'gi'
    ),
    '$1'
  )

  // Remove SVG tags which can contain malicious code, but preserve their text content
  preprocessed = preprocessed.replace(
    /<\s*svg[^>]*>[\s\S]*?<\s*\/\s*svg\s*>/gi,
    match => {
      // Extract text content from between SVG tags, removing any nested HTML tags
      return match.replace(/<[^>]*>/g, '')
    }
  )
  preprocessed = preprocessed.replace(/<\s*svg[^>]*\/?\s*>/gi, '')

  // Remove any remaining dangerous patterns
  preprocessed = preprocessed.replace(/<!--[\s\S]*?-->/g, '') // Remove comments that might contain code
  preprocessed = preprocessed.replace(/<![\s\S]*?>/g, '') // Remove any other declarations

  const sanitized = DOMPurify.sanitize(preprocessed, {
    ALLOWED_TAGS: sanitization.allowedTags,
    ALLOWED_ATTR: sanitization.allowedAttributes,
    FORBID_TAGS: sanitization.forbiddenTags,
    FORBID_ATTR: sanitization.forbiddenAttributes,
    SANITIZE_DOM: sanitization.sanitizeDom,
  })

  // Third layer: Additional sanitization to remove any dangerous patterns that might remain
  return sanitized
    .replace(/<\s*a[^>]*>([\s\S]*?)<\s*\/\s*a\s*>/gi, '$1') // Remove anchor tags but preserve their content
    .replace(/<\s*a[^>]*\/?\s*>/gi, '') // Remove self-closing anchor tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove any event handlers
    .replace(/&#(\d+);?/g, '') // Remove HTML entities that might be used for encoding
    .replace(/&#[xX]([0-9a-fA-F]+);?/g, '') // Remove hex HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace - replace multiple spaces with single space
}

/**
 * Sanitizes and highlights search terms in content while preventing XSS
 * @param text - The text to highlight
 * @param searchQuery - The search query to highlight
 * @returns HTML string with highlighted terms, safely sanitized
 */
export const sanitizeAndHighlight = (
  text: string,
  searchQuery: string
): string => {
  if (!searchQuery || !text) return text || ''

  const { sanitization } = securityConfig

  // First, sanitize the input text to prevent XSS
  const sanitizedText = sanitizeForXSS(text)

  // Escape special regex characters in search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  // Create highlighted text - only highlighting the already sanitized text
  const highlightClasses = `${themeConfig.search.highlightBg} ${themeConfig.search.highlightText}`
  const highlighted = sanitizedText.replace(
    regex,
    `<mark class="${highlightClasses}">$&</mark>`
  )

  const fullySanitized = DOMPurify.sanitize(highlighted, {
    ALLOWED_TAGS: sanitization.allowedTags,
    ALLOWED_ATTR: sanitization.allowedAttributes,
    FORBID_TAGS: sanitization.forbiddenTags,
    FORBID_ATTR: sanitization.forbiddenAttributes,
    SANITIZE_DOM: sanitization.sanitizeDom,
  })

  // Return the fully sanitized HTML
  return fullySanitized
}
