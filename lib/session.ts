'use client'

import { supabase } from './supabase'

const SESSION_STORAGE_KEY = 'wikiflash_session_id'

export async function getSessionId(): Promise<string> {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      // Verify session exists in Supabase
      const { data } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', stored)
        .single()
      
      if (data) {
        return stored
      }
    }
  }

  // Create new session
  const { data, error } = await supabase
    .from('sessions')
    .insert({})
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to create session')
  }

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, data.id)
  }

  return data.id
}
