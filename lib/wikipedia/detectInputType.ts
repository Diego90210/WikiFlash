/**
 * Detects whether the input is a Wikipedia URL or a topic name
 * @param input - The user input (could be URL or topic)
 * @returns 'url' if it's a Wikipedia URL, 'topic' otherwise
 */
export function detectInputType(input: string): 'url' | 'topic' {
  if (!input || typeof input !== 'string') {
    return 'topic'
  }

  const trimmed = input.trim()

  // Wikipedia URL patterns:
  // - https://en.wikipedia.org/wiki/Page_Title
  // - https://www.wikipedia.org/wiki/Page_Title
  // - https://[language].wikipedia.org/wiki/Page_Title
  // - http://en.wikipedia.org/wiki/Page_Title (non-HTTPS)
  // - en.wikipedia.org/wiki/Page_Title (without protocol)
  // - Mobile URLs: en.m.wikipedia.org/wiki/Page_Title
  const wikipediaUrlPattern = /^(https?:\/\/)?(www\.)?([a-z]{2,3}(-[a-z]{2,3})?\.)?(m\.)?wikipedia\.org\/wiki\/[^\s]+/i

  if (wikipediaUrlPattern.test(trimmed)) {
    return 'url'
  }

  return 'topic'
}

/**
 * Extracts the page title from a Wikipedia URL
 * @param url - Wikipedia URL
 * @returns The page title (decoded) or null if invalid
 */
export function extractPageTitleFromUrl(url: string): string | null {
  try {
    // Handle URLs with or without protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(urlWithProtocol)

    // Extract pathname (e.g., "/wiki/Page_Title")
    const pathname = urlObj.pathname

    // Check if it's a Wikipedia wiki path
    if (!pathname.startsWith('/wiki/')) {
      return null
    }

    // Extract title (everything after /wiki/)
    const title = pathname.slice(6) // Remove '/wiki/'

    // Decode URL encoding (e.g., "Page_Title" -> "Page Title")
    const decoded = decodeURIComponent(title.replace(/_/g, ' '))

    return decoded
  } catch (error) {
    // Invalid URL format
    return null
  }
}

