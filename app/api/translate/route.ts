/**
 * API route for translating text using Groq
 */
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const TRANSLATE_TIMEOUT_MS = 15_000
const VALID_LANGUAGES = ['en', 'es']
const MAX_TEXT_LENGTH = 5_000

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP
  const ip = getClientIp(request)
  const { allowed, retryAfterMs } = checkRateLimit(`tr:${ip}`, 20, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const { text, fromLang, toLang } = body

    if (!text || typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: 'Invalid text' }, { status: 400 })
    }
    if (!fromLang || !toLang) {
      return NextResponse.json({ error: 'Languages required' }, { status: 400 })
    }
    // Strict allowlist — prevents prompt injection via language fields
    if (!VALID_LANGUAGES.includes(fromLang) || !VALID_LANGUAGES.includes(toLang)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }
    if (fromLang === toLang) {
      return NextResponse.json({ translatedText: text })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ translatedText: text })
    }

    const langNames: Record<string, string> = { en: 'English', es: 'Spanish' }
    const fromName = langNames[fromLang]
    const toName = langNames[toLang]

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
            { role: 'system', content: `You are a translator. Translate from ${fromName} to ${toName}. Return ONLY the translated text, no explanations, no quotes, no formatting.` },
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
    console.error('Translation error:', error instanceof Error ? error.message : error)
    const body = await request.json().catch(() => ({}))
    return NextResponse.json({ translatedText: body.text || '' })
  }
}

