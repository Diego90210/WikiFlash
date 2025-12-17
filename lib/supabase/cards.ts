/**
 * Supabase functions for card management and spaced repetition
 */

import { supabase } from '../supabase'
import type { CardRow } from './decks'

export interface CardWithSM2 extends CardRow {
  // Already includes all SM-2 fields from CardRow
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * Used ONLY for new cards (never studied) - not for scheduled reviews
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get all cards due for review in a deck
 * Cards are due if next_review <= today
 * 
 * IMPORTANT: Cards are returned in SCHEDULED ORDER (not shuffled)
 * - Oldest due cards first (most urgent - overdue cards)
 * - Then cards due today
 * - This respects the SM-2 algorithm's scheduling
 * 
 * Spaced repetition relies on SCHEDULING, not randomness.
 * The algorithm determines WHEN cards appear based on memory retention.
 */
export async function getDueCards(deckId: string): Promise<CardWithSM2[]> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .lte('next_review', today)
    .order('next_review', { ascending: true }) // Oldest due cards first (most urgent)
    .order('ease_factor', { ascending: true }) // Then by difficulty (harder cards first)

  if (error) {
    throw new Error(`Failed to fetch due cards: ${error.message}`)
  }

  // Return in SCHEDULED order - NO SHUFFLING
  // The algorithm has determined optimal timing - respect that order
  return data || []
}

/**
 * Get new cards (never studied - repetitions = 0)
 * These cards can be shuffled since they have no schedule yet
 * 
 * @param deckId - Deck ID
 * @param limit - Maximum number of new cards to return (default: 5)
 */
export async function getNewCards(deckId: string, limit: number = 5): Promise<CardWithSM2[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .eq('repetitions', 0) // Never studied
    .eq('interval', 0) // New cards
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch new cards: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  // New cards CAN be shuffled (no schedule yet)
  return shuffleArray(data)
}

/**
 * Get count of cards due for review in a deck
 * Used to check if study session should be enabled
 */
export async function getDueCardsCount(deckId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  const { count, error } = await supabase
    .from('cards')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', deckId)
    .lte('next_review', today)

  if (error) {
    throw new Error(`Failed to count due cards: ${error.message}`)
  }

  return count || 0
}

/**
 * Get the next review date for a deck (earliest next_review date)
 * Returns null if no cards exist in the deck
 */
export async function getNextReviewDate(deckId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('cards')
    .select('next_review')
    .eq('deck_id', deckId)
    .order('next_review', { ascending: true })
    .limit(1)

  if (error) {
    throw new Error(`Failed to get next review date: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return null
  }

  return data[0].next_review
}

/**
 * Update a card's SM-2 data after review
 */
export async function updateCard(
  cardId: string,
  updates: {
    ease_factor: number
    interval: number
    repetitions: number
    next_review: string
  }
): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({
      ease_factor: updates.ease_factor,
      interval: updates.interval,
      repetitions: updates.repetitions,
      next_review: updates.next_review,
    })
    .eq('id', cardId)

  if (error) {
    throw new Error(`Failed to update card: ${error.message}`)
  }
}

