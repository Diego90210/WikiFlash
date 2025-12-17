/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on the SuperMemo 2 algorithm by Dr. Piotr Wozniak (1987)
 * 
 * Quality Rating Scale (0-5):
 * 0: Complete blackout
 * 1: Incorrect response; correct one remembered
 * 2: Incorrect response; correct one seemed easy to recall
 * 3: Correct response recalled with serious difficulty
 * 4: Correct response after a hesitation
 * 5: Perfect response
 */

export interface CardData {
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string // ISO date string
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5 // SM-2 quality rating (0-5)

/**
 * Update card data based on SM-2 algorithm
 * @param card - Current card data
 * @param quality - User's rating: 0-5 (SM-2 quality scale)
 * @returns Updated card data
 */
export function updateCard(card: CardData, quality: Quality): CardData {
  let newEaseFactor = card.ease_factor
  let newInterval = card.interval
  let newRepetitions = card.repetitions

  // SM-2 Algorithm Rules:
  // If quality < 3: Reset card (n=0, I=1, EF unchanged)
  // If quality >= 3: Progress card (n++, calculate I, adjust EF)
  
  if (quality < 3) {
    // Quality 0-2: Complete failure, card goes back to relearning
    // Reset repetition count and interval, but keep ease factor unchanged
    newRepetitions = 0
    newInterval = 1
    // EF remains unchanged (not adjusted for q < 3)
  } else {
    // Quality 3-5: Successful recall, progress the card
    
    // Calculate new ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
    const factor = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    newEaseFactor = card.ease_factor + factor
    
    // Ensure ease factor doesn't go below 1.3
    newEaseFactor = Math.max(1.3, newEaseFactor)

    // Calculate new interval based on repetition count
    if (card.repetitions === 0) {
      // First successful review: interval = 1 day
      newInterval = 1
    } else if (card.repetitions === 1) {
      // Second successful review: interval = 6 days
      newInterval = 6
    } else {
      // Subsequent reviews: interval = previous interval × EF
      newInterval = Math.round(card.interval * newEaseFactor)
    }

    // Increment repetition count
    newRepetitions = card.repetitions + 1
  }

  // Calculate next review date
  const today = new Date()
  today.setDate(today.getDate() + newInterval)
  const nextReview = today.toISOString().split('T')[0] // YYYY-MM-DD format

  return {
    ease_factor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    next_review: nextReview,
  }
}

/**
 * Map user-friendly rating to SM-2 quality (0-5)
 * 
 * Rating mapping:
 * - "very_hard" = 0-2 (complete failure, card resets)
 * - "hard" = 3 (difficult recall, moderate success)
 * - "good" = 4 (good recall, slight hesitation)
 * - "easy" = 5 (perfect recall)
 * 
 * Note: For "very_hard", we use quality 2 (middle of 0-2 range)
 * to represent "incorrect response; correct one seemed easy to recall"
 */
export function mapRatingToQuality(rating: 'very_hard' | 'hard' | 'good' | 'easy' | 'too_easy'): Quality {
  switch (rating) {
    case 'very_hard':
      return 2 // Maps to quality 2 (incorrect but seemed easy to recall)
    case 'hard':
      return 3 // Maps to quality 3 (correct with serious difficulty)
    case 'good':
      return 4 // Maps to quality 4 (correct after hesitation)
    case 'easy':
      return 5 // Maps to quality 5 (perfect response)
    case 'too_easy':
      return 5 // Maps to quality 5 (perfect response)
    default:
      return 3 // Default to "hard" (quality 3)
  }
}

