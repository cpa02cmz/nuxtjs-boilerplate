// Generate unique ID with timestamp + random component
// Format: base36(timestamp) + 8-char base36(random)
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return timestamp + random
}
