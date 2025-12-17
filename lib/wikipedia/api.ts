/**
 * Wikipedia API integration
 * Uses the MediaWiki API to search and fetch Wikipedia content
 */

export interface WikipediaSearchResult {
  title: string
  snippet: string
  pageid: number
}

export interface WikipediaPage {
  title: string
  content: string
  extract?: string
  pageid: number
}

export interface WikipediaApiError {
  code: string
  info: string
}

/**
 * Search Wikipedia for a topic
 * @param topic - The topic to search for
 * @returns Array of search results
 */
export async function searchWikipedia(topic: string): Promise<WikipediaSearchResult[]> {
  if (!topic || !topic.trim()) {
    throw new Error('Topic cannot be empty')
  }

  const searchUrl = new URL('https://en.wikipedia.org/w/api.php')
  searchUrl.searchParams.set('action', 'query')
  searchUrl.searchParams.set('list', 'search')
  searchUrl.searchParams.set('srsearch', topic.trim())
  searchUrl.searchParams.set('format', 'json')
  searchUrl.searchParams.set('origin', '*')
  searchUrl.searchParams.set('srlimit', '5') // Limit to 5 results

  try {
    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Wikipedia API error: ${data.error.info || data.error.code}`)
    }

    if (!data.query || !data.query.search) {
      return []
    }

    return data.query.search.map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      pageid: result.pageid,
    }))
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to search Wikipedia')
  }
}

/**
 * Get Wikipedia page content by title
 * @param title - The page title
 * @returns Wikipedia page content
 */
export async function getPageContent(title: string): Promise<WikipediaPage> {
  if (!title || !title.trim()) {
    throw new Error('Title cannot be empty')
  }

  const contentUrl = new URL('https://en.wikipedia.org/w/api.php')
  contentUrl.searchParams.set('action', 'query')
  contentUrl.searchParams.set('prop', 'extracts|info')
  contentUrl.searchParams.set('titles', title.trim())
  contentUrl.searchParams.set('format', 'json')
  contentUrl.searchParams.set('origin', '*')
  contentUrl.searchParams.set('exintro', 'false') // Get full content, not just intro
  contentUrl.searchParams.set('explaintext', 'false') // Keep HTML for parsing
  contentUrl.searchParams.set('exsectionformat', 'plain')

  try {
    const response = await fetch(contentUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Wikipedia API error: ${data.error.info || data.error.code}`)
    }

    const pages = data.query?.pages
    if (!pages) {
      throw new Error('No pages found in API response')
    }

    // Get the first (and usually only) page
    const pageId = Object.keys(pages)[0]
    const page = pages[pageId]

    if (page.missing) {
      throw new Error(`Wikipedia page not found: ${title}`)
    }

    if (page.invalid) {
      throw new Error(`Invalid Wikipedia page title: ${title}`)
    }

    // Check for disambiguation pages
    if (page.extract && page.extract.includes('may refer to:')) {
      throw new Error(`Disambiguation page: ${title}. Please be more specific.`)
    }

    return {
      title: page.title,
      content: page.extract || '',
      pageid: page.pageid,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch Wikipedia page')
  }
}

/**
 * Get Wikipedia page HTML content (for parsing)
 * @param title - The page title
 * @returns HTML content of the page
 */
export async function getPageHtml(title: string): Promise<string> {
  if (!title || !title.trim()) {
    throw new Error('Title cannot be empty')
  }

  const htmlUrl = new URL('https://en.wikipedia.org/w/api.php')
  htmlUrl.searchParams.set('action', 'parse')
  htmlUrl.searchParams.set('page', title.trim())
  htmlUrl.searchParams.set('format', 'json')
  htmlUrl.searchParams.set('origin', '*')
  htmlUrl.searchParams.set('prop', 'text')
  htmlUrl.searchParams.set('disableeditsection', 'true')
  htmlUrl.searchParams.set('disabletoc', 'true')

  try {
    const response = await fetch(htmlUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Wikipedia API error: ${data.error.info || data.error.code}`)
    }

    if (!data.parse || !data.parse.text || !data.parse.text['*']) {
      throw new Error(`Wikipedia page not found: ${title}`)
    }

    return data.parse.text['*']
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch Wikipedia page HTML')
  }
}


