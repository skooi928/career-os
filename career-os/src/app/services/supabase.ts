import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mgqmcfawkgiwjdhxazmy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncW1jZmF3a2dpd2pkaHhhem15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxOTc3NjksImV4cCI6MjA5NDc3Mzc2OX0.iOH4XicnT34kZ9jotMNy4VLFdygid6sGnyNTwtgauWQ'

let supabaseClient: any = null

export function getSupabaseClient() {
  try {
    // Only initialize in browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (!supabaseClient) {
        console.log('Initializing Supabase client...')
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
        console.log('✓ Supabase client initialized')
      }
      return supabaseClient
    }
    console.warn('Supabase: Not in browser environment')
    return null
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return null
  }
}
