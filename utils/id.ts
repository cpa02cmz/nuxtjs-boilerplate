// Generate unique ID with timestamp prefix (base36)
// Format: <timestamp-base36><8-random-chars>
export const generateUniqueId = (): string => {
  const timestamp = Date.now().toString(36)

  // Generate 8 random characters in base36
  let random = ''
  for (let i = 0; i < 8; i++) {
    random += Math.floor(Math.random() * 36).toString(36)
  }

  return timestamp + random
}
