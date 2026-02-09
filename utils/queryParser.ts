import type { SearchQuery } from '~/types/search'
import { patternsConfig } from '~/configs/patterns.config'

const removeQuotes = (term: string): string => {
  return term.replace(patternsConfig.search.quotePattern, '')
}

export const parseQuery = (query: string): SearchQuery => {
  if (!query) {
    return { terms: [], operators: [], filters: {} }
  }

  const hasOperators = patternsConfig.search.operatorPattern.test(query)

  if (hasOperators) {
    const terms: string[] = []
    const operators: ('AND' | 'OR' | 'NOT')[] = []

    const parts = query
      .split(patternsConfig.search.operatorSplitPattern)
      .map(part => part.trim())
      .filter(Boolean)

    for (const part of parts) {
      const upperPart = part.toUpperCase()

      if (upperPart === 'AND') {
        operators.push('AND')
      } else if (upperPart === 'OR') {
        operators.push('OR')
      } else if (upperPart === 'NOT') {
        operators.push('NOT')
      } else if (part) {
        const cleanTerm = removeQuotes(part)
        if (cleanTerm) {
          terms.push(cleanTerm)
        }
      }
    }

    return { terms, operators, filters: {} }
  } else {
    const simpleTerms: string[] = []
    let currentTerm = ''
    let inQuotes = false

    for (let i = 0; i < query.length; i++) {
      const char = query[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ' ' && !inQuotes) {
        if (currentTerm) {
          simpleTerms.push(removeQuotes(currentTerm))
          currentTerm = ''
        }
      } else {
        currentTerm += char
      }
    }

    if (currentTerm) {
      simpleTerms.push(removeQuotes(currentTerm))
    }

    return { terms: simpleTerms, operators: [], filters: {} }
  }
}
