import { useResourcesRefactored } from './useResourcesRefactored'

// Main composable for managing resources - now using refactored version
export const useResources = () => {
  return useResourcesRefactored()
}
