/**
 * Cross-language Wikipedia search
 * Finds the best article regardless of language, then the caller generates
 * flashcards in the user's preferred language (Groq handles this).
 */

import { searchWikipedia, getPageHtml, type WikipediaSearchResult } from './api'
import { parseWikipediaContent } from './parser'

export type Language = 'en' | 'es'

export interface CrossLanguageResult {
  title: string
  content: string
  sourceLanguage: Language
  pageid: number
}

/**
 * Search both English and Spanish Wikipedia for a topic.
 * Returns the best article found, preferring the user's language
 * but falling back to whichever has more content.
 */
export async function findBestArticle(
  topic: string,
  userLanguage: Language
): Promise<CrossLanguageResult> {
  const otherLanguage: Language = userLanguage === 'en' ? 'es' : 'en'

  // Search both languages in parallel
  const [userResults, otherResults] = await Promise.all([
    searchWikipedia(topic, userLanguage).catch(() => [] as WikipediaSearchResult[]),
    searchWikipedia(topic, otherLanguage).catch(() => [] as WikipediaSearchResult[]),
  ])

  // Prefer user's language if a result exists
  if (userResults.length > 0) {
    const best = userResults[0]
    const html = await getPageHtml(best.title, userLanguage)
    const parsed = parseWikipediaContent(html, best.title)
    return {
      title: best.title,
      content: parsed.text,
      sourceLanguage: userLanguage,
      pageid: best.pageid,
    }
  }

  // Fall back to other language
  if (otherResults.length > 0) {
    const best = otherResults[0]
    const html = await getPageHtml(best.title, otherLanguage)
    const parsed = parseWikipediaContent(html, best.title)
    return {
      title: best.title,
      content: parsed.text,
      sourceLanguage: otherLanguage,
      pageid: best.pageid,
    }
  }

  throw new Error(`No Wikipedia articles found for "${topic}" in any language.`)
}
