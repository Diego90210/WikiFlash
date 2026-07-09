/**
 * API route for translating text using Groq
 */
import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const TRANSLATE_TIMEOUT_MS = 15_000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, fromLang, toLang } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }
    if (!fromLang || !toLang) {
      return NextResponse.json({ error: 'Source and target languages are required' }, { status: 400 })
    }
    if (fromLang === toLang) {
      return NextResponse.json({ translatedText: text })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ translatedText: text })
    }

    const langNames: Record<string, string> = { en: 'English', es: 'Spanish' }
    const fromName = langNames[fromLang] ?? fromLang
    const toName = langNames[toLang] ?? toLang

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS)

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
            { role: 'system', content: `You are a translator. Translate the user's text from ${fromName} to ${toName}. Return ONLY the translated text, no explanations, no quotes, no formatting.` },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      return NextResponse.json({ translatedText: text })
    }

    const data = await response.json()
    const translated = data.choices?.[0]?.message?.content?.trim()

    return NextResponse.json({ translatedText: translated || text })
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback: return original text
    const body = await request.json().catch(() => ({}))
    return NextResponse.json({ translatedText: body.text || '' })
  }
}

