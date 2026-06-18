import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://pckhyelspsqhjkqbspra.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lmcnlmz1imq1olZmHuRs1Q_Vdo5HGAw'

export const supabase = createClient(url, key)
