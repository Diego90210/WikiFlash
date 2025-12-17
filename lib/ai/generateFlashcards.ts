/**
 * AI flashcard generation using Groq API
 */

import { getSystemPrompt, getUserPrompt, type FlashcardPromptInput } from './prompts'

export interface Flashcard {
  question: string
  answer: string
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

/**
 * Generate flashcards from Wikipedia content using Groq API
 * @param content - Wikipedia article content
 * @param count - Number of flashcards to generate
 * @param topic - Topic/title of the article
 * @returns Array of flashcards
 */
export async function generateFlashcards(
  content: string,
  count: number,
  topic: string
): Promise<Flashcard[]> {
  if (!content || !content.trim()) {
    throw new Error('Content is required for flashcard generation')
  }

  if (count < 1 || count > 50) {
    throw new Error('Card count must be between 1 and 50')
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Groq API key is not configured')
  }

  const promptInput: FlashcardPromptInput = {
    content: content.trim(),
    topic,
    count,
  }

  const systemPrompt = getSystemPrompt()
  const userPrompt = getUserPrompt(promptInput)

  let lastError: Error | null = null

  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : INITIAL_RETRY_DELAY * Math.pow(2, attempt)
          
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
          
          throw new Error('Rate limit exceeded. Please try again in a moment.')
        }

        // Handle other errors
        const errorMessage = errorData.error?.message || `API error: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content received from API')
      }

      // Parse JSON response
      const parsed = parseFlashcardResponse(content, count)
      
      // Validate we got the right number
      if (parsed.length !== count) {
        console.warn(`Requested ${count} cards but got ${parsed.length}. Regenerating...`)
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, attempt)))
          continue
        }
      }

      return parsed

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred')
      
      // If it's a parsing error or validation error, don't retry
      if (error instanceof Error && (
        error.message.includes('Invalid JSON') ||
        error.message.includes('validation')
      )) {
        throw error
      }

      // For other errors, retry with exponential backoff
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }

  // If we exhausted all retries
  throw lastError || new Error('Failed to generate flashcards after multiple attempts')
}

/**
 * Parse and validate flashcard response from API
 */
function parseFlashcardResponse(content: string, expectedCount: number): Flashcard[] {
  // Clean the content - remove markdown code blocks if present
  let cleaned = content.trim()
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
  cleaned = cleaned.replace(/\s*```$/i, '').replace(/\s*```$/i, '')

  // Try to extract JSON object or array
  let jsonData: any
  
  try {
    jsonData = JSON.parse(cleaned)
  } catch (error) {
    // Try to find JSON array in the text
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      try {
        jsonData = JSON.parse(arrayMatch[0])
      } catch {
        throw new Error('Invalid JSON response from API. Could not parse flashcard data.')
      }
    } else {
      throw new Error('Invalid JSON response from API. No valid JSON found.')
    }
  }

  // Handle different response formats
  let flashcards: Flashcard[] = []

  if (Array.isArray(jsonData)) {
    flashcards = jsonData
  } else if (jsonData.flashcards && Array.isArray(jsonData.flashcards)) {
    flashcards = jsonData.flashcards
  } else if (jsonData.cards && Array.isArray(jsonData.cards)) {
    flashcards = jsonData.cards
  } else {
    // Try to find any array in the object
    const arrayKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]))
    if (arrayKey) {
      flashcards = jsonData[arrayKey]
    } else {
      throw new Error('Invalid response format. Expected an array of flashcards.')
    }
  }

  // Validate flashcards
  const validFlashcards = flashcards
    .filter((card: any) => {
      return (
        card &&
        typeof card === 'object' &&
        typeof card.question === 'string' &&
        typeof card.answer === 'string' &&
        card.question.trim().length > 0 &&
        card.answer.trim().length > 0
      )
    })
    .map((card: any) => ({
      question: card.question.trim(),
      answer: card.answer.trim(),
    }))

  if (validFlashcards.length === 0) {
    throw new Error('No valid flashcards found in API response.')
  }

  // If we got fewer than expected, pad with what we have (or regenerate)
  if (validFlashcards.length < expectedCount) {
    console.warn(`Got ${validFlashcards.length} cards but requested ${expectedCount}`)
    // Return what we have - the caller can decide to retry
    return validFlashcards
  }

  // Return the requested number
  return validFlashcards.slice(0, expectedCount)
}
