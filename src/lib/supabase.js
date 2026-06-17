import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || url === 'YOUR_PROJECT_URL_HERE') {
  console.error(
    '⚠️  CreatorFlow: Missing Supabase credentials.\n' +
    'Create a .env file in the creator-flow folder with:\n' +
    'VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  )
}

export const supabase = createClient(url ?? '', key ?? '')
