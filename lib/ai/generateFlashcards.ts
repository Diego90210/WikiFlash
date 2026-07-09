/**
 * AI flashcard generation — Groq primary, Gemini fallback, local last resort.
 */

import { getSystemPrompt, getUserPrompt, type FlashcardPromptInput, type QuestionType, type GenerationProfile, isValidQuestionType } from './prompts'
import { callGemini } from './gemini'

export interface Flashcard {
  question: string
  answer: string
  type: QuestionType
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const FETCH_TIMEOUT_MS = 20_000

/**
 * Generate flashcards: Groq → Gemini → local fallback.
 */
export async function generateFlashcards(
  content: string,
  count: number,
  topic: string,
  language: 'en' | 'es' = 'en',
  sourceLanguage?: 'en' | 'es',
  profile?: GenerationProfile
): Promise<Flashcard[]> {
  if (!content?.trim()) throw new Error('Content is required for flashcard generation')
  if (count < 1 || count > 50) throw new Error('Card count must be between 1 and 50')

  const promptInput: FlashcardPromptInput = {
    content: content.trim(),
    topic,
    count,
    language,
    sourceLanguage,
    profile,
  }

  // 1. Try Groq
  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    try {
      return await callGroq(groqKey, promptInput, language)
    } catch (error) {
      console.warn('Groq failed:', error instanceof Error ? error.message : error)
    }
  }

  // 2. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      return await callGemini(geminiKey, promptInput, language)
    } catch (error) {
      console.warn('Gemini failed:', error instanceof Error ? error.message : error)
    }
  }

  // 3. Local fallback
  console.warn('All AI providers unavailable — using local fallback')
  return generateFallbackFlashcards(content, count, topic, language)
}

// ── Groq call (single attempt, hard timeout) ─────────────────────────────────

async function callGroq(
  apiKey: string,
  promptInput: FlashcardPromptInput,
  language: 'en' | 'es'
): Promise<Flashcard[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: getSystemPrompt(language) },
          { role: 'user', content: getUserPrompt(promptInput) },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })
  } finally {
    clearTimeout(timer)
  }

  // Any non-OK status (including 429) → throw immediately, caller falls back
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = (body as any)?.error?.message ?? response.statusText
    throw new Error(`Groq ${response.status}: ${detail}`)
  }

  const data = await response.json()
  const aiText: string | undefined = data.choices?.[0]?.message?.content

  if (!aiText) throw new Error('Empty response from Groq')

  return parseFlashcardResponse(aiText, promptInput.count)
}

// ── Local fallback ────────────────────────────────────────────────────────────

/**
 * Extracts meaningful flashcards from raw text without any API call.
 * All fallback cards are type "recall" since there's no LLM to reason about types.
 */
function generateFallbackFlashcards(
  content: string,
  count: number,
  topic: string,
  language: 'en' | 'es'
): Flashcard[] {
  const isEs = language === 'es'
  const cards: Flashcard[] = []

  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 400)

  const templates = isEs
    ? [
        (t: string) => `¿Qué es ${t}?`,
        (t: string) => `¿Cómo se describe ${t}?`,
        (t: string) => `¿Qué caracteriza a ${t}?`,
        (t: string) => `¿Cuál es la importancia de ${t}?`,
        (t: string) => `¿Qué se sabe sobre ${t}?`,
      ]
    : [
        (t: string) => `What is ${t}?`,
        (t: string) => `How is ${t} described?`,
        (t: string) => `What characterizes ${t}?`,
        (t: string) => `What is the significance of ${t}?`,
        (t: string) => `What do we know about ${t}?`,
      ]

  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const answer = sentences[i].endsWith('.') ? sentences[i] : sentences[i] + '.'
    cards.push({ question: templates[i % templates.length](topic), answer, type: 'recall' })
  }

  // Pad with chunked content if sentences weren't enough
  if (cards.length < count) {
    const chunks = content.match(/.{100,300}/g) ?? [topic]
    for (let i = cards.length; i < count; i++) {
      const chunk = chunks[i % chunks.length].trim()
      const answer = chunk.endsWith('.') ? chunk : chunk + '.'
      cards.push({ question: templates[i % templates.length](topic), answer, type: 'recall' })
    }
  }

  return cards.slice(0, count)
}

// ── Response parser ───────────────────────────────────────────────────────────

function parseFlashcardResponse(raw: string, expectedCount: number): Flashcard[] {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/gi, '')

  let jsonData: unknown
  try {
    jsonData = JSON.parse(cleaned)
  } catch {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (!arrayMatch) throw new Error('No valid JSON array found in Groq response')
    jsonData = JSON.parse(arrayMatch[0])
  }

  let rawCards: unknown[]
  if (Array.isArray(jsonData)) {
    rawCards = jsonData
  } else if (jsonData && typeof jsonData === 'object') {
    const obj = jsonData as Record<string, unknown>
    const key =
      ['flashcards', 'cards'].find(k => Array.isArray(obj[k])) ??
      Object.keys(obj).find(k => Array.isArray(obj[k]))
    if (!key) throw new Error('No flashcard array found in Groq response')
    rawCards = obj[key] as unknown[]
  } else {
    throw new Error('Unexpected Groq response shape')
  }

  const valid: Flashcard[] = rawCards
    .filter(
      (c): c is { question: string; answer: string; type?: string } =>
        !!c &&
        typeof c === 'object' &&
        typeof (c as any).question === 'string' &&
        typeof (c as any).answer === 'string' &&
        (c as any).question.trim().length > 0 &&
        (c as any).answer.trim().length > 0
    )
    .map(c => ({
      question: c.question.trim(),
      answer: c.answer.trim(),
      type: c.type && isValidQuestionType(c.type) ? c.type : 'recall',
    }))

  if (valid.length === 0) throw new Error('Groq returned no valid flashcards')

  // Deduplicate — remove cards with very similar questions
  const deduped = deduplicateCards(valid)

  if (deduped.length < expectedCount) {
    console.warn(`Groq returned ${deduped.length}/${expectedCount} cards after dedup`)
  }

  return deduped.slice(0, expectedCount)
}

// ── Deduplication ──────────────────────────────────────────────────────────

function normalizeForDedup(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[¿?¡!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Strip common question starters to compare the "core" of the question
function extractQuestionCore(q: string): string {
  return q
    .replace(/^(¿|)(qué|cómo|cuál|cuáles|por qué|dónde|quién|cuándo|cuánto|cuánta|cuántos|cuántas|en qué|de qué|con qué|para qué|what|how|which|where|who|when|why|how much|how many|in what|of what|with what|for what)\s+/i, '')
    .replace(/\s+de\s+.+$/i, '') // remove "de X" suffix
    .trim()
}

function deduplicateCards(cards: Flashcard[]): Flashcard[] {
  const seen = new Map<string, string>() // core → original question
  const result: Flashcard[] = []

  for (const card of cards) {
    const norm = normalizeForDedup(card.question)
    const core = extractQuestionCore(norm)

    // Skip if we already have a question with the same core
    if (seen.has(core)) continue

    seen.set(core, card.question)
    result.push(card)
  }

  return result
}
