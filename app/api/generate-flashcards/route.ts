/**
 * API route for generating flashcards using Groq
 * API key stays server-side only.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateFlashcards } from '@/lib/ai/generateFlashcards'
import type { GenerationProfile } from '@/lib/ai/prompts'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const ROUTE_TIMEOUT_MS = 25_000
const VALID_PROFILES: GenerationProfile[] = ['quick_review', 'deep_understanding', 'balanced']
const VALID_LANGUAGES = ['en', 'es']
const MAX_CONTENT_LENGTH = 50_000
const MAX_TOPIC_LENGTH = 200

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute per IP
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = checkRateLimit(`gen:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const { content, count, topic, language = 'en', sourceLanguage, profile } = body

    if (!content || typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }
    if (!count || typeof count !== 'number' || count < 1 || count > 50) {
      return NextResponse.json({ error: 'Invalid count' }, { status: 400 })
    }
    if (!topic || typeof topic !== 'string' || topic.length > MAX_TOPIC_LENGTH) {
      return NextResponse.json({ error: 'Invalid topic' }, { status: 400 })
    }

    const validLanguage = VALID_LANGUAGES.includes(language) ? language : 'en'
    const validSourceLanguage = sourceLanguage && VALID_LANGUAGES.includes(sourceLanguage)
      ? sourceLanguage : undefined
    const validProfile: GenerationProfile | undefined =
      profile && VALID_PROFILES.includes(profile) ? profile : undefined

    const flashcards = await Promise.race([
      generateFlashcards(content, count, topic, validLanguage, validSourceLanguage, validProfile),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), ROUTE_TIMEOUT_MS)
      ),
    ])

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error('Route error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Failed to generate flashcards. Please try again.' },
      { status: 500 }
    )
  }
}
