/**
 * Wikipedia content parser
 * Extracts and cleans plain text from Wikipedia HTML
 */

export interface ParsedContent {
  title: string
  text: string
  summary: string
  wordCount: number
}

/**
 * Extract plain text from Wikipedia HTML
 * Removes references, citations, navigation elements, and other non-content
 * @param html - Wikipedia HTML content
 * @param title - Page title
 * @param maxWords - Maximum number of words to extract (default: 5000)
 * @returns Parsed content with title, text, summary, and word count
 */
export function parseWikipediaContent(
  html: string,
  title: string,
  maxWords: number = 5000
): ParsedContent {
  if (!html || !title) {
    throw new Error('HTML and title are required')
  }

  // Create a temporary DOM element to parse HTML
  // Since we're in Node.js/Next.js, we'll use a simple regex-based approach
  // For more complex parsing, we could use a library like jsdom or cheerio
  let text = html

  // Remove script and style tags and their content
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Remove navigation elements
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  text = text.replace(/<div[^>]*class="[^"]*nav[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')

  // Remove references and citations
  text = text.replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
  text = text.replace(/<span[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
  text = text.replace(/<ol[^>]*class="[^"]*references[^"]*"[^>]*>[\s\S]*?<\/ol>/gi, '')
  text = text.replace(/\[citation needed\]/gi, '')
  text = text.replace(/\[who\?\]/gi, '')
  text = text.replace(/\[when\?\]/gi, '')

  // Remove edit links and edit sections
  text = text.replace(/<span[^>]*class="[^"]*mw-editsection[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
  text = text.replace(/\[edit\]/gi, '')

  // Remove tables (optional - might want to keep some)
  text = text.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '')

  // Remove infoboxes
  text = text.replace(/<div[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')

  // Remove images and media
  text = text.replace(/<img[^>]*>/gi, '')
  text = text.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')

  // Remove links but keep the text content
  text = text.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  text = decodeHtmlEntities(text)

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n\n')
  text = text.trim()

  // Extract summary (first paragraph or first 200 words)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const summary = sentences.slice(0, 3).join('. ').trim() || text.split(' ').slice(0, 50).join(' ')

  // Limit to maxWords
  const words = text.split(/\s+/)
  const wordCount = words.length
  const limitedText = words.slice(0, maxWords).join(' ')

  return {
    title,
    text: limitedText,
    summary: summary.length > 300 ? summary.substring(0, 300) + '...' : summary,
    wordCount: Math.min(wordCount, maxWords),
  }
}

/**
 * Decode HTML entities
 * @param text - Text with HTML entities
 * @returns Decoded text
 */
function decodeHtmlEntities(text: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
  }

  let decoded = text
  for (const [entity, char] of Object.entries(entityMap)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char)
  }

  // Decode numeric entities (&#123; and &#x1F;)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

  return decoded
}


