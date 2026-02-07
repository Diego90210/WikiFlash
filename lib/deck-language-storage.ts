/**
 * Utility to store and retrieve deck language information
 * Uses localStorage as a simple storage solution
 */

const STORAGE_KEY = 'wikiflash-deck-languages'

export function storeDeckLanguage(deckId: string, language: 'en' | 'es'): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const languages: Record<string, 'en' | 'es'> = stored ? JSON.parse(stored) : {}
    languages[deckId] = language
    localStorage.setItem(STORAGE_KEY, JSON.stringify(languages))
  } catch (error) {
    console.error('Failed to store deck language:', error)
  }
}

export function getDeckLanguage(deckId: string): 'en' | 'es' | undefined {
  if (typeof window === 'undefined') return undefined
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return undefined
    const languages: Record<string, 'en' | 'es'> = JSON.parse(stored)
    return languages[deckId]
  } catch (error) {
    console.error('Failed to get deck language:', error)
    return undefined
  }
}

export function removeDeckLanguage(deckId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    const languages: Record<string, 'en' | 'es'> = JSON.parse(stored)
    delete languages[deckId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(languages))
  } catch (error) {
    console.error('Failed to remove deck language:', error)
  }
}

