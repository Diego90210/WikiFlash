/**
 * Gemini API client for flashcard generation and translation.
 * Uses Google's native API format (not OpenAI-compatible).
 */

import { getSystemPrompt, getUserPrompt, type FlashcardPromptInput, type GenerationProfile, isValidQuestionType, type QuestionType } from './prompts'
import type { Flashcard } from './generateFlashcards'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const FETCH_TIMEOUT_MS = 20_000

interface GeminiPart { text: string }
interface GeminiContent { role: string; parts: GeminiPart[] }
interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] }
  }>
}

// ── Flashcard generation ───────────────────────────────────────────────────

export async function callGemini(
  apiKey: string,
  promptInput: FlashcardPromptInput,
  language: 'en' | 'es'
): Promise<Flashcard[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: getUserPrompt(promptInput) }] },
        ],
        systemInstruction: {
          parts: [{ text: getSystemPrompt(language) }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    })
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = (body as any)?.error?.message ?? response.statusText
    throw new Error(`Gemini ${response.status}: ${detail}`)
  }

  const data: GeminiResponse = await response.json()
  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!aiText) throw new Error('Empty response from Gemini')

  return parseFlashcardResponse(aiText, promptInput.count)
}

// ── Translation ────────────────────────────────────────────────────────────

export async function callGeminiTranslate(
  apiKey: string,
  text: string,
  fromName: string,
  toName: string
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)

  let response: Response
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text }] },
        ],
        systemInstruction: {
          parts: [{ text: `You are a translator. Translate from ${fromName} to ${toName}. Return ONLY the translated text, no explanations, no quotes, no formatting.` }],
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        },
      }),
    })
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) return null

  const data: GeminiResponse = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
}

// ── Response parser (reused from Groq) ─────────────────────────────────────

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
    if (!arrayMatch) throw new Error('No valid JSON array found in Gemini response')
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
    if (!key) throw new Error('No flashcard array found in Gemini response')
    rawCards = obj[key] as unknown[]
  } else {
    throw new Error('Unexpected Gemini response shape')
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

  if (valid.length === 0) throw new Error('Gemini returned no valid flashcards')

  // Deduplicate
  const seen = new Map<string, string>()
  const deduped: Flashcard[] = []
  for (const card of valid) {
    const norm = card.question
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^(¿|)(qué|cómo|cuál|cuáles|por qué|dónde|quién|cuándo|what|how|which|where|who|when|why)\s+/i, '')
      .replace(/\s+de\s+.+$/i, '')
      .trim()

    if (!seen.has(norm)) {
      seen.set(norm, card.question)
      deduped.push(card)
    }
  }

  return deduped.slice(0, expectedCount)
}
