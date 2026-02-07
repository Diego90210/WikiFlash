/**
 * API route for translating text
 * This keeps translation API keys secure on the server side
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, fromLang, toLang } = body

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!fromLang || !toLang) {
      return NextResponse.json(
        { error: 'Source and target languages are required' },
        { status: 400 }
      )
    }

    // If languages are the same, no translation needed
    if (fromLang === toLang) {
      return NextResponse.json({ translatedText: text })
    }

    // Use LibreTranslate (free, open-source) as translation service
    // You can replace this with Google Translate API, DeepL, etc.
    try {
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: fromLang,
          target: toLang,
          format: 'text',
        }),
      })

      if (!response.ok) {
        // Fallback: return original text if translation fails
        return NextResponse.json({ translatedText: text })
      }

      const data = await response.json()
      return NextResponse.json({ translatedText: data.translatedText || text })
    } catch (fetchError) {
      // If the translation service is unavailable, return original text
      console.error('Translation service error:', fetchError)
      return NextResponse.json({ translatedText: text })
    }
  } catch (error) {
    console.error('Translation error:', error)
    // On error, return original text
    const body = await request.json().catch(() => ({}))
    return NextResponse.json({ translatedText: body.text || '' })
  }
}

