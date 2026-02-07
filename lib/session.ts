'use client'

import { supabase } from './supabase'

const SESSION_STORAGE_KEY = 'wikiflash_session_id'

export async function getSessionId(): Promise<string> {
  // Validate Supabase client
  if (!supabase) {
    throw new Error('Supabase client is not initialized')
  }

  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      // Verify session exists in Supabase
      const { data, error: verifyError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', stored)
        .single()
      
      if (verifyError) {
        console.warn('Error verifying stored session, creating new one:', verifyError)
        // Continue to create new session
      } else if (data) {
        return stored
      }
    }
  }

  // Create new session
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert({})
      .select()
      .single()

    if (error) {
      // Log full error details for debugging
      console.error('Supabase error creating session:', {
        error,
        errorString: JSON.stringify(error, null, 2),
        errorKeys: Object.keys(error),
        errorMessage: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        errorHint: error?.hint,
      })
      
      const errorMessage = error?.message || error?.code || error?.details || JSON.stringify(error) || 'Unknown error'
      throw new Error(`Failed to create session: ${errorMessage}`)
    }

    if (!data) {
      console.error('No data returned from session creation', { data, error })
      throw new Error('Failed to create session: No data returned')
    }

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, data.id)
    }

    return data.id
  } catch (err) {
    // Catch any unexpected errors
    console.error('Unexpected error in getSessionId:', err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(`Failed to create session: ${String(err)}`)
  }
}
