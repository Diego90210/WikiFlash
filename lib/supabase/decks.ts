/**
 * Supabase functions for deck management
 */

import { supabase } from '../supabase'
import type { Deck, Flashcard } from '@/app/page'

export interface DeckRow {
  id: string
  name: string
  topic: string
  session_id: string
  created_at: string
  last_studied_at: string | null
}

export interface CardRow {
  id: string
  deck_id: string
  question: string
  answer: string
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string
  created_at: string
}

/**
 * Create a new deck with cards
 */
export async function createDeck(
  name: string,
  topic: string,
  sessionId: string,
  cards: Flashcard[]
): Promise<Deck> {
  // Start a transaction by creating the deck first
  const { data: deckData, error: deckError } = await supabase
    .from('decks')
    .insert({
      name,
      topic,
      session_id: sessionId,
    })
    .select()
    .single()

  if (deckError || !deckData) {
    throw new Error(`Failed to create deck: ${deckError?.message || 'Unknown error'}`)
  }

  // Create cards if provided
  if (cards.length > 0) {
    const cardRows = cards.map((card) => ({
      deck_id: deckData.id,
      question: card.question,
      answer: card.answer,
      ease_factor: 2.5, // Default ease factor for SM-2
      interval: 0, // New card
      repetitions: 0,
      next_review: new Date().toISOString(), // Review immediately
    }))

    const { error: cardsError } = await supabase.from('cards').insert(cardRows)

    if (cardsError) {
      // Rollback: delete the deck if cards failed
      await supabase.from('decks').delete().eq('id', deckData.id)
      throw new Error(`Failed to create cards: ${cardsError.message}`)
    }
  }

  return {
    id: deckData.id,
    name: deckData.name,
    topic: deckData.topic,
    cardCount: cards.length,
    dueCount: cards.length, // All new cards are due
    lastStudied: deckData.last_studied_at ? new Date(deckData.last_studied_at) : undefined,
  }
}

/**
 * Get all decks for a session
 */
export async function getDecks(sessionId: string): Promise<Deck[]> {
  const { data: decksData, error: decksError } = await supabase
    .from('decks')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (decksError) {
    throw new Error(`Failed to fetch decks: ${decksError.message}`)
  }

  if (!decksData || decksData.length === 0) {
    return []
  }

  // Get card counts for each deck
  const deckIds = decksData.map((d) => d.id)
  const { data: cardsData, error: cardsError } = await supabase
    .from('cards')
    .select('deck_id, next_review')
    .in('deck_id', deckIds)

  if (cardsError) {
    console.error('Error fetching card counts:', cardsError)
    // Continue without card counts
  }

  // Calculate stats for each deck
  const today = new Date().toISOString().split('T')[0]

  return decksData.map((deck) => {
    const deckCards = cardsData?.filter((c) => c.deck_id === deck.id) || []
    const totalCards = deckCards.length
    const dueCards = deckCards.filter((c) => {
      if (!c.next_review) return true
      const reviewDate = new Date(c.next_review).toISOString().split('T')[0]
      return reviewDate <= today
    }).length

    return {
      id: deck.id,
      name: deck.name,
      topic: deck.topic,
      cardCount: totalCards,
      dueCount: dueCards,
      lastStudied: deck.last_studied_at ? new Date(deck.last_studied_at) : undefined,
    }
  })
}

/**
 * Update deck name
 */
export async function updateDeck(deckId: string, newName: string): Promise<void> {
  const { error } = await supabase
    .from('decks')
    .update({ name: newName })
    .eq('id', deckId)

  if (error) {
    throw new Error(`Failed to update deck: ${error.message}`)
  }
}

/**
 * Update deck's last_studied_at timestamp
 */
export async function updateDeckLastStudied(deckId: string): Promise<void> {
  const { error } = await supabase
    .from('decks')
    .update({ last_studied_at: new Date().toISOString() })
    .eq('id', deckId)

  if (error) {
    throw new Error(`Failed to update deck last studied: ${error.message}`)
  }
}

/**
 * Delete a deck (cascades to cards)
 */
export async function deleteDeck(deckId: string): Promise<void> {
  const { error } = await supabase.from('decks').delete().eq('id', deckId)

  if (error) {
    throw new Error(`Failed to delete deck: ${error.message}`)
  }
}

