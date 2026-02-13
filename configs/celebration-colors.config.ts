// Celebration Colors Configuration - All Celebration/Confetti Colors
// Flexy hates hardcoded values! All celebration colors are now configurable.

export const celebrationColorsConfig = {
  // Confetti colors for reading progress completion - Flexy hates hardcoded hex codes!
  readingProgress: {
    colors: [
      process.env.CELEBRATION_READING_COLOR_1 || '#ff6b6b',
      process.env.CELEBRATION_READING_COLOR_2 || '#4ecdc4',
      process.env.CELEBRATION_READING_COLOR_3 || '#45b7d1',
      process.env.CELEBRATION_READING_COLOR_4 || '#96ceb4',
      process.env.CELEBRATION_READING_COLOR_5 || '#ffeaa7',
      process.env.CELEBRATION_READING_COLOR_6 || '#dda0dd',
      process.env.CELEBRATION_READING_COLOR_7 || '#98d8c8',
      process.env.CELEBRATION_READING_COLOR_8 || '#f7dc6f',
    ],
  },

  // General celebration confetti colors
  confetti: {
    colors: [
      process.env.CONFETTI_COLOR_1 || '#3b82f6',
      process.env.CONFETTI_COLOR_2 || '#8b5cf6',
      process.env.CONFETTI_COLOR_3 || '#10b981',
      process.env.CONFETTI_COLOR_4 || '#f59e0b',
      process.env.CONFETTI_COLOR_5 || '#ef4444',
      process.env.CONFETTI_COLOR_6 || '#06b6d4',
      process.env.CONFETTI_COLOR_7 || '#f97316',
      process.env.CONFETTI_COLOR_8 || '#ec4899',
    ],
  },

  // Achievement/award colors
  achievement: {
    gold: process.env.ACHIEVEMENT_GOLD || '#ffd700',
    silver: process.env.ACHIEVEMENT_SILVER || '#c0c0c0',
    bronze: process.env.ACHIEVEMENT_BRONZE || '#cd7f32',
  },

  // Milestone colors
  milestone: {
    25: process.env.MILESTONE_25_COLOR || '#3b82f6',
    50: process.env.MILESTONE_50_COLOR || '#8b5cf6',
    75: process.env.MILESTONE_75_COLOR || '#f59e0b',
    100: process.env.MILESTONE_100_COLOR || '#10b981',
  },

  // Progress bar gradient colors
  progressGradient: {
    start: process.env.PROGRESS_GRADIENT_START || '#3b82f6',
    middle: process.env.PROGRESS_GRADIENT_MIDDLE || '#8b5cf6',
    end: process.env.PROGRESS_GRADIENT_END || '#3b82f6',
  },

  // Completion checkmark colors
  completion: {
    circleBg: process.env.COMPLETION_CIRCLE_BG || 'rgba(16, 185, 129, 0.1)',
    circleBorder: process.env.COMPLETION_CIRCLE_BORDER || '#10b981',
    checkmarkColor: process.env.COMPLETION_CHECKMARK_COLOR || '#10b981',
  },
} as const

export type CelebrationColorsConfig = typeof celebrationColorsConfig
