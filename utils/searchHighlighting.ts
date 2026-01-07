import { sanitizeAndHighlight } from '~/utils/sanitize'

export const highlightSearchTerms = (
  text: string,
  searchQuery: string
): string => {
  if (!searchQuery || !text) return text || ''

  return sanitizeAndHighlight(text, searchQuery)
}

export const createSearchSnippet = (
  text: string,
  searchQuery: string,
  maxLength: number = 160
): string => {
  if (!searchQuery || !text) return text?.substring(0, maxLength) || ''

  const lowerText = text.toLowerCase()
  const lowerQuery = searchQuery.toLowerCase()

  const queryTerms = lowerQuery.split(/\s+/).filter(term => term.length > 0)
  let bestStart = -1
  let bestEnd = -1
  let bestScore = -1

  for (const term of queryTerms) {
    let pos = 0
    while ((pos = lowerText.indexOf(term, pos)) !== -1) {
      let start = Math.max(0, pos - Math.floor(maxLength / 4))
      let end = Math.min(
        text.length,
        pos + term.length + Math.floor(maxLength / 4)
      )

      while (
        start > 0 &&
        text[start] !== ' ' &&
        text[start] !== '.' &&
        text[start] !== ','
      ) {
        start--
      }
      start = Math.max(0, start)

      while (
        end < text.length &&
        text[end] !== ' ' &&
        text[end] !== '.' &&
        text[end] !== ','
      ) {
        end++
      }
      end = Math.min(text.length, end)

      const windowText = text.substring(start, end).toLowerCase()
      let score = 0
      for (const queryTerm of queryTerms) {
        if (windowText.includes(queryTerm)) {
          score++
        }
      }

      if (
        score > bestScore ||
        (score === bestScore &&
          Math.abs(start - (bestStart === -1 ? 0 : bestStart)) < maxLength / 2)
      ) {
        bestScore = score
        bestStart = start
        bestEnd = end
      }

      pos++
    }
  }

  if (bestStart !== -1 && bestEnd !== -1) {
    let snippet = text.substring(bestStart, bestEnd).trim()

    if (bestStart > 0) {
      snippet = '...' + snippet
    }
    if (bestEnd < text.length) {
      snippet = snippet + '...'
    }

    return sanitizeAndHighlight(snippet, searchQuery)
  } else {
    const plainText = text.substring(0, maxLength)
    return sanitizeAndHighlight(plainText, searchQuery)
  }
}
