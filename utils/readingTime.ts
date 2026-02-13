/**
 * Reading Time Calculator - Palette's micro-UX enhancement! 🎨
 *
 * Calculates estimated reading time for content to help users
 * make informed decisions about which resources to explore.
 *
 * Features:
 * - Configurable words per minute (default: 200 for average reading speed)
 * - Smart content extraction (removes HTML tags, extra whitespace)
 * - Human-friendly formatting ("1 min read", "5 min read")
 * - Accessibility support via screen reader announcements
 * - Image time estimation (adds 12 seconds per image for viewing)
 *
 * @example
 * const readingTime = calculateReadingTime(resource.description)
 * // Returns: { minutes: 3, text: "3 min read", seconds: 180 }
 */

export interface ReadingTimeResult {
  /** Estimated reading time in minutes (rounded up) */
  minutes: number
  /** Human-readable formatted text (e.g., "3 min read") */
  text: string
  /** Total estimated time in seconds */
  seconds: number
  /** Word count of the content */
  wordCount: number
  /** Whether content is very short (under 1 minute) */
  isQuickRead: boolean
  /** Screen reader announcement text */
  ariaText: string
}

export interface ReadingTimeOptions {
  /** Words per minute reading speed (default: 200) */
  wordsPerMinute?: number
  /** Seconds to add per image (default: 12) */
  secondsPerImage?: number
  /** Minimum time to display in minutes (default: 1) */
  minDisplayMinutes?: number
  /** Format for the reading time text */
  format?: 'short' | 'long' | 'abbreviated'
  /** Locale for formatting */
  locale?: string
}

// Default reading speed (words per minute) - average adult reading speed
const DEFAULT_WPM = 200

// Time to view an image (in seconds) - accounts for looking at screenshots/diagrams
const DEFAULT_SECONDS_PER_IMAGE = 12

// Minimum display time in minutes
const DEFAULT_MIN_DISPLAY_MINUTES = 1

// Quick read threshold (under this many minutes)
const QUICK_READ_THRESHOLD = 2

/**
 * Strip HTML tags from content
 */
const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: use simple regex
    return html.replace(/<[^>]*>/g, '')
  }
  // Client-side: use DOM API for better accuracy
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * Count images in HTML content
 */
const countImages = (html: string): number => {
  const imgMatches = html.match(/<img[^>]*>/gi)
  return imgMatches ? imgMatches.length : 0
}

/**
 * Clean and normalize text content
 */
const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/[^\w\s]/g, '') // Remove punctuation for word counting
    .trim()
}

/**
 * Calculate word count from text
 */
const countWords = (text: string): number => {
  const clean = cleanText(text)
  if (!clean) return 0
  return clean.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Format reading time text based on options
 */
const formatReadingTime = (
  minutes: number,
  options: ReadingTimeOptions = {}
): { text: string; ariaText: string } => {
  const { format = 'short' } = options

  // Handle sub-minute reads
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60)
    switch (format) {
      case 'long':
        return {
          text: `${seconds} second${seconds !== 1 ? 's' : ''} read`,
          ariaText: `Quick read, approximately ${seconds} seconds`,
        }
      case 'abbreviated':
        return {
          text: `<1m`,
          ariaText: `Less than 1 minute read`,
        }
      default: // short
        return {
          text: '< 1 min read',
          ariaText: `Quick read, less than 1 minute`,
        }
    }
  }

  // Round to nearest minute for cleaner display
  const roundedMinutes = Math.round(minutes)

  switch (format) {
    case 'long':
      return {
        text: `${roundedMinutes} minute${roundedMinutes !== 1 ? 's' : ''} read`,
        ariaText: `Approximately ${roundedMinutes} minute${roundedMinutes !== 1 ? 's' : ''} read`,
      }
    case 'abbreviated':
      return {
        text: `${roundedMinutes}m`,
        ariaText: `${roundedMinutes} minute read`,
      }
    default: // short
      return {
        text: `${roundedMinutes} min read`,
        ariaText: `${roundedMinutes} minute read`,
      }
  }
}

/**
 * Calculate estimated reading time for content
 *
 * @param content - The content to analyze (can contain HTML)
 * @param options - Configuration options
 * @returns Reading time estimate with multiple formats
 *
 * @example
 * // Basic usage
 * const time = calculateReadingTime('This is a short article...')
 * console.log(time.text) // "1 min read"
 *
 * @example
 * // With HTML content
 * const time = calculateReadingTime('<p>This is...</p><img src="...">', {
 *   wordsPerMinute: 250,
 *   secondsPerImage: 10
 * })
 */
export const calculateReadingTime = (
  content: string,
  options: ReadingTimeOptions = {}
): ReadingTimeResult => {
  const {
    wordsPerMinute = DEFAULT_WPM,
    secondsPerImage = DEFAULT_SECONDS_PER_IMAGE,
    minDisplayMinutes = DEFAULT_MIN_DISPLAY_MINUTES,
    format = 'short',
  } = options

  // Handle empty content
  if (!content || content.trim().length === 0) {
    return {
      minutes: minDisplayMinutes,
      text:
        format === 'abbreviated'
          ? `${minDisplayMinutes}m`
          : `${minDisplayMinutes} min read`,
      seconds: minDisplayMinutes * 60,
      wordCount: 0,
      isQuickRead: minDisplayMinutes < QUICK_READ_THRESHOLD,
      ariaText: `${minDisplayMinutes} minute read`,
    }
  }

  // Strip HTML and count words
  const plainText = stripHtml(content)
  const wordCount = countWords(plainText)

  // Count images for additional time
  const imageCount = countImages(content)
  const imageTimeSeconds = imageCount * secondsPerImage

  // Calculate reading time
  const readingTimeSeconds = (wordCount / wordsPerMinute) * 60
  const totalSeconds = readingTimeSeconds + imageTimeSeconds
  const totalMinutes = totalSeconds / 60

  // Round up to nearest minute for display, but respect minimum
  const displayMinutes = Math.max(minDisplayMinutes, Math.ceil(totalMinutes))

  // Format the output
  const { text, ariaText } = formatReadingTime(totalMinutes, options)

  return {
    minutes: displayMinutes,
    text,
    seconds: Math.round(totalSeconds),
    wordCount,
    isQuickRead: displayMinutes < QUICK_READ_THRESHOLD,
    ariaText,
  }
}

/**
 * Calculate reading time for a resource with title and description
 *
 * @param title - Resource title
 * @param description - Resource description
 * @param options - Configuration options
 * @returns Combined reading time estimate
 */
export const calculateResourceReadingTime = (
  title: string,
  description: string,
  options: ReadingTimeOptions = {}
): ReadingTimeResult => {
  // Combine title and description, giving title less weight
  const combinedContent = `${title}\n\n${description}`
  return calculateReadingTime(combinedContent, options)
}

/**
 * Quick helper to get just the reading time text
 *
 * @param content - Content to analyze
 * @param format - Output format
 * @returns Formatted reading time string
 */
export const getReadingTimeText = (
  content: string,
  format: ReadingTimeOptions['format'] = 'short'
): string => {
  return calculateReadingTime(content, { format }).text
}

export default calculateReadingTime
