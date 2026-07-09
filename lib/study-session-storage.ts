/**
 * Study session storage utilities
 * Saves and restores study session progress
 */

export type StudySessionState = {
  deckId: string
  currentCardIndex: number
  totalCards: number
  stats: { very_hard: number; hard: number; good: number; easy: number; too_easy: number }
  cardIds: string[] // Track the order of cards in this session
  timestamp: number
}

const STORAGE_KEY = 'wikiflash-study-session'

/**
 * Save the current study session state
 */
export function saveStudySessionState(state: StudySessionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('Failed to save study session state:', error)
  }
}

/**
 * Get the saved study session state for a specific deck
 */
export function getStudySessionState(deckId: string): StudySessionState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    
    const state: StudySessionState = JSON.parse(saved)
    
    // Check if this state is for the same deck and not too old (24 hours)
    const isSameDeck = state.deckId === deckId
    const isRecent = Date.now() - state.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    
    if (isSameDeck && isRecent) {
      return state
    }
    
    // Clear old or different deck state
    clearStudySessionState()
    return null
  } catch (error) {
    console.warn('Failed to get study session state:', error)
    return null
  }
}

/**
 * Clear the saved study session state
 */
export function clearStudySessionState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear study session state:', error)
  }
}
