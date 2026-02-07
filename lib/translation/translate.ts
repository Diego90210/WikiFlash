/**
 * Translation utilities for flashcards
 * Uses a simple translation approach - can be enhanced with API integration
 */

export type Language = 'en' | 'es'

/**
 * Translate text from one language to another
 * For now, this is a placeholder that returns the original text
 * In production, this would call a translation API (Google Translate, DeepL, etc.)
 * 
 * @param text - Text to translate
 * @param fromLang - Source language
 * @param toLang - Target language
 * @returns Translated text
 */
export async function translateText(
  text: string,
  fromLang: Language,
  toLang: Language
): Promise<string> {
  // If languages are the same, no translation needed
  if (fromLang === toLang) {
    return text
  }

  // For MVP, we'll use a simple approach with fetch to a translation service
  // You can replace this with your preferred translation API
  try {
    // Using LibreTranslate (free, open-source) as an example
    // Replace with your preferred translation service
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text',
      }),
    })

    if (!response.ok) {
      // Fallback: return original text if translation fails
      console.warn('Translation failed, returning original text')
      return text
    }

    const data = await response.json()
    return data.translatedText || text
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback: return original text
    return text
  }
}

/**
 * Translate a flashcard (both question and answer)
 */
export async function translateCard(
  card: { question: string; answer: string },
  fromLang: Language,
  toLang: Language
): Promise<{ question: string; answer: string }> {
  if (fromLang === toLang) {
    return card
  }

  const [question, answer] = await Promise.all([
    translateText(card.question, fromLang, toLang),
    translateText(card.answer, fromLang, toLang),
  ])

  return { question, answer }
}

/**
 * Translate multiple cards in parallel (with batching to avoid rate limits)
 */
export async function translateCards(
  cards: Array<{ question: string; answer: string }>,
  fromLang: Language,
  toLang: Language,
  batchSize: number = 5
): Promise<Array<{ question: string; answer: string }>> {
  if (fromLang === toLang) {
    return cards
  }

  const translated: Array<{ question: string; answer: string }> = []

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize)
    const batchTranslations = await Promise.all(
      batch.map(card => translateCard(card, fromLang, toLang))
    )
    translated.push(...batchTranslations)
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < cards.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return translated
}

