/**
 * API route for generating flashcards using Groq
 * This keeps the API key secure on the server side
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateFlashcards } from '@/lib/ai/generateFlashcards'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, count, topic } = body

    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!count || typeof count !== 'number' || count < 1 || count > 50) {
      return NextResponse.json(
        { error: 'Count must be a number between 1 and 50' },
        { status: 400 }
      )
    }

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Generate flashcards
    const flashcards = await generateFlashcards(content, count, topic)

    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error('Error generating flashcards:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards'
    
    // Return appropriate status codes
    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 429 }
      )
    }

    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
