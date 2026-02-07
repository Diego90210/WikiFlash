/**
 * Supported languages for WikiFlash
 */
export type Language = 'en' | 'es'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  wikipediaDomain: string
}

export const SUPPORTED_LANGUAGES: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    wikipediaDomain: 'en.wikipedia.org',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    wikipediaDomain: 'es.wikipedia.org',
  },
}

export const DEFAULT_LANGUAGE: Language = 'en'

/**
 * Get Wikipedia API URL for a given language
 */
export function getWikipediaApiUrl(language: Language): string {
  const config = SUPPORTED_LANGUAGES[language]
  return `https://${config.wikipediaDomain}/w/api.php`
}

/**
 * Extract language code from Wikipedia URL
 * @param url - Wikipedia URL
 * @returns Language code (e.g., 'en', 'es') or null if not found
 */
export function extractLanguageFromUrl(url: string): Language | null {
  try {
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(urlWithProtocol)
    const hostname = urlObj.hostname

    // Match patterns like: en.wikipedia.org, es.wikipedia.org, en.m.wikipedia.org
    // Also handle www.wikipedia.org (defaults to English)
    if (hostname === 'www.wikipedia.org' || hostname === 'wikipedia.org') {
      return 'en'
    }
    
    const match = hostname.match(/^([a-z]{2,3})(-[a-z]{2,3})?\.(m\.)?wikipedia\.org$/i)
    
    if (match) {
      const langCode = match[1].toLowerCase() as Language
      // Validate it's a supported language
      if (langCode in SUPPORTED_LANGUAGES) {
        return langCode
      }
    }
    
    return null
  } catch {
    return null
  }
}

