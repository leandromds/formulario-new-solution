import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

function createSupabaseClient() {
  if (!url || !publishableKey) return null
  try {
    return createClient(url, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch {
    // Configuração inválida não impede o preenchimento ou a recuperação do rascunho.
    return null
  }
}

export const supabase = createSupabaseClient()
