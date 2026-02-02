/**
 * Shared CSS utility classes for common component patterns
 * Reduces duplication and ensures consistency across the UI
 */

// Card styles
export const cardStyles = {
  base: 'bg-white rounded-lg shadow',
  hover:
    'bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300',
  bordered: 'bg-white rounded-lg shadow border border-gray-200',
  skeleton: 'bg-white p-6 rounded-lg shadow animate-pulse',
} as const

// Button styles
export const buttonStyles = {
  primary:
    'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200',
  secondary:
    'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
  menuItem:
    'flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
  icon: 'p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
} as const

// Input styles
export const inputStyles = {
  base: 'block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  search:
    'block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-offset-2 focus-visible:ring-blue-600 hover:border-gray-400',
} as const

// Icon sizes
export const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const

// Spacing
export const spacing = {
  cardPadding: 'p-6',
  sectionGap: 'mt-6',
  elementGap: 'mt-3',
} as const
