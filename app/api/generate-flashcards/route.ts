/**
 * API route for generating flashcards using Groq
 * API key stays server-side only.
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateFlashcards } from '@/lib/ai/generateFlashcards'
import type { GenerationProfile } from '@/lib/ai/prompts'

// Hard ceiling: Next.js serverless functions default to 10 s on hobby plans.
// Adjust to match your platform limit (Vercel Pro = 60 s, etc.)
const ROUTE_TIMEOUT_MS = 25_000

const VALID_PROFILES: GenerationProfile[] = ['quick_review', 'deep_understanding', 'balanced']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, count, topic, language = 'en', sourceLanguage, profile } = body

    // Validate
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    if (!count || typeof count !== 'number' || count < 1 || count > 50) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 50' },
        { status: 400 }
      )
    }
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const validLanguage = language === 'es' ? 'es' : 'en'
    const validProfile: GenerationProfile | undefined =
      profile && VALID_PROFILES.includes(profile) ? profile : undefined

    // Race the generation against a hard timeout so the route always responds.
    const flashcards = await Promise.race([
      generateFlashcards(content, count, topic, validLanguage, sourceLanguage, validProfile),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Generation timed out')), ROUTE_TIMEOUT_MS)
      ),
    ])

    return NextResponse.json({ flashcards })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate flashcards'
    console.error('Route error:', message)

    const status = message.includes('timed out') ? 504
      : message.includes('API key') ? 500
      : 500

    return NextResponse.json({ error: message }, { status })
  }
}
