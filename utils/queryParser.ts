import type { SearchQuery } from '~/types/search'

export const parseQuery = (query: string): SearchQuery => {
  if (!query) {
    return { terms: [], operators: [], filters: {} }
  }

  const hasOperators = /(\bAND\b|\bOR\b|\bNOT\b)/i.test(query)

  if (hasOperators) {
    const terms: string[] = []
    const operators: ('AND' | 'OR' | 'NOT')[] = []

    const parts = query
      .split(/(AND|OR|NOT)/gi)
      .map(part => part.trim())
      .filter(Boolean)

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (part.toUpperCase() === 'AND') {
        operators.push('AND')
      } else if (part.toUpperCase() === 'OR') {
        operators.push('OR')
      } else if (part.toUpperCase() === 'NOT') {
        operators.push('NOT')
      } else if (part) {
        const cleanTerm = part.replace(/"/g, '')
        if (cleanTerm) {
          terms.push(cleanTerm)
        }
      }
    }

    return { terms, operators, filters: {} }
  } else {
    const simpleTerms = query
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0)
    return { terms: simpleTerms, operators: [], filters: {} }
  }
}
