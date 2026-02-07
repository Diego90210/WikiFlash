"use client"

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language/context'
import type { Flashcard } from '@/app/page'

/**
 * Hook to translate cards if the deck language doesn't match the current UI language
 */
export function useCardTranslation(
  cards: Flashcard[],
  deckLanguage: 'en' | 'es' | undefined
) {
  const { language: currentLanguage } = useLanguage()
  const [translatedCards, setTranslatedCards] = useState<Flashcard[]>(cards)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    // If no cards, return empty array
    if (cards.length === 0) {
      setTranslatedCards([])
      setIsTranslating(false)
      return
    }

    // If no deck language specified, assume it matches current language
    if (!deckLanguage) {
      setTranslatedCards(cards)
      setIsTranslating(false)
      return
    }

    // If languages match, no translation needed
    if (deckLanguage === currentLanguage) {
      setTranslatedCards(cards)
      setIsTranslating(false)
      return
    }

    // Languages don't match - translate cards
    const translateCards = async () => {
      setIsTranslating(true)
      try {
        // Translate in batches to avoid overwhelming the API
        const batchSize = 3
        const translated: Flashcard[] = []

        for (let i = 0; i < cards.length; i += batchSize) {
          const batch = cards.slice(i, i + batchSize)
          const batchTranslations = await Promise.all(
            batch.map(async (card) => {
              try {
                const [questionRes, answerRes] = await Promise.all([
                  fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      text: card.question,
                      fromLang: deckLanguage,
                      toLang: currentLanguage,
                    }),
                  }),
                  fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      text: card.answer,
                      fromLang: deckLanguage,
                      toLang: currentLanguage,
                    }),
                  }),
                ])

                if (!questionRes.ok || !answerRes.ok) {
                  // If translation fails, return original card
                  return card
                }

                const questionData = await questionRes.json()
                const answerData = await answerRes.json()

                return {
                  ...card,
                  question: questionData.translatedText || card.question,
                  answer: answerData.translatedText || card.answer,
                }
              } catch (error) {
                console.error('Translation error for card:', error)
                // Return original card if translation fails
                return card
              }
            })
          )
          translated.push(...batchTranslations)
          
          // Small delay between batches to respect rate limits
          if (i + batchSize < cards.length) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        }
        
        setTranslatedCards(translated)
      } catch (error) {
        console.error('Translation error:', error)
        // Fallback to original cards
        setTranslatedCards(cards)
      } finally {
        setIsTranslating(false)
      }
    }

    translateCards()
  }, [cards, deckLanguage, currentLanguage])

  return { translatedCards, isTranslating }
}

