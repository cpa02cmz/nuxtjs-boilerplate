import DOMPurify from 'dompurify'

const testInput = 'This is safe content with <strong>HTML</strong> tags'

const result = DOMPurify.sanitize(testInput, {
  ALLOWED_TAGS: [], // Start with no HTML tags allowed
  ALLOWED_ATTR: [],
  FORBID_TAGS: ['strong', 'b', 'i', 'em', 'u', 'span', 'div', 'p'],
})

console.log('Input:', testInput)
console.log('Output:', result)
