import { randomUUID } from 'node:crypto'

export const generateUniqueId = (): string => {
  return randomUUID()
}
