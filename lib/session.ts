'use client'

import { supabase } from './supabase'

const SESSION_STORAGE_KEY = 'wikiflash_session_id'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function getSessionId(): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized')
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      const { data, error: verifyError } = await supabase
        .from('sessions')
        .select('id, created_at')
        .eq('id', stored)
        .single()

      if (!verifyError && data) {
        // Check TTL — expire sessions older than 30 days
        const createdAt = new Date(data.created_at).getTime()
        if (Date.now() - createdAt < SESSION_TTL_MS) {
          return stored
        }
        // Session expired — remove and create new one
        localStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }
  }

  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert({})
      .select()
      .single()

    if (error) {
      console.error('Failed to create session:', error.message)
      throw new Error('Failed to create session')
    }

    if (!data) {
      throw new Error('Failed to create session')
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, data.id)
    }

    return data.id
  } catch (err) {
    if (err instanceof Error) throw err
    throw new Error('Failed to create session')
  }
}
