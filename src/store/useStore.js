import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Map Supabase row (snake_case) → JS object (camelCase)
const fromIdea = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  type: row.type,
  platforms: row.platforms || [],
  notes: row.notes || '',
  createdAt: row.created_at,
})

const fromEntry = (row) => ({
  id: row.id,
  ideaId: row.idea_id || null,
  title: row.title,
  description: row.description || '',
  date: row.date,
  entryType: row.entry_type,
  platforms: row.platforms || ['youtube', 'tiktok', 'instagram'],
  performance: row.performance || {},
  editingChecklist: row.editing_checklist || { scriptReady: false, ingredients: false, voiceRecorded: false, captions: false },
  createdAt: row.created_at,
})

const useStore = create((set, get) => ({
  ideas: [],
  entries: [],
  loading: true,

  // ── Bootstrap ──────────────────────────────────────────────────
  init: async () => {
    const [ideasRes, entriesRes] = await Promise.all([
      supabase.from('ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('entries').select('*').order('created_at', { ascending: false }),
    ])
    if (ideasRes.error)   console.error('CreatorFlow – fetch ideas failed:',   ideasRes.error)
    if (entriesRes.error) console.error('CreatorFlow – fetch entries failed:', entriesRes.error)
    set({
      ideas:   (ideasRes.data   || []).map(fromIdea),
      entries: (entriesRes.data || []).map(fromEntry),
      loading: false,
    })
  },

  // ── Ideas ──────────────────────────────────────────────────────
  addIdea: (idea) => {
    supabase
      .from('ideas')
      .insert([{
        title: idea.title,
        description: idea.description || '',
        type: idea.type || 'idea',
        platforms: idea.platforms || [],
        notes: idea.notes || '',
      }])
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) console.error('CreatorFlow – add idea failed:', error)
        if (data)  set((s) => ({ ideas: [fromIdea(data), ...s.ideas] }))
      })
  },

  updateIdea: (id, updates) => {
    const dbUpdates = {}
    if (updates.title       !== undefined) dbUpdates.title       = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.type        !== undefined) dbUpdates.type        = updates.type
    if (updates.platforms   !== undefined) dbUpdates.platforms   = updates.platforms
    if (updates.notes       !== undefined) dbUpdates.notes       = updates.notes

    // Optimistic
    set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? { ...i, ...updates } : i)) }))

    supabase.from('ideas').update(dbUpdates).eq('id', id).select().single()
      .then(({ data }) => {
        if (data) set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? fromIdea(data) : i)) }))
      })
  },

  deleteIdea: (id) => {
    set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }))
    supabase.from('ideas').delete().eq('id', id)
  },

  // ── Entries ────────────────────────────────────────────────────
  addEntry: (entry) => {
    supabase
      .from('entries')
      .insert([{
        idea_id:    entry.ideaId || null,
        title:      entry.title,
        description: entry.description || '',
        date:       entry.date,
        entry_type: entry.entryType || 'idea',
        platforms:  ['youtube', 'tiktok', 'instagram'],
        performance: {},
      }])
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) console.error('CreatorFlow – add entry failed:', error)
        if (data)  set((s) => ({ entries: [fromEntry(data), ...s.entries] }))
      })
  },

  updateEntry: (id, updates) => {
    const dbUpdates = {}
    if (updates.title       !== undefined) dbUpdates.title       = updates.title
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.date        !== undefined) dbUpdates.date        = updates.date
    if (updates.entryType        !== undefined) dbUpdates.entry_type        = updates.entryType
    if (updates.platforms        !== undefined) dbUpdates.platforms         = updates.platforms
    if (updates.editingChecklist !== undefined) dbUpdates.editing_checklist = updates.editingChecklist

    // Optimistic
    set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)) }))

    supabase.from('entries').update(dbUpdates).eq('id', id).select().single()
      .then(({ data }) => {
        if (data) set((s) => ({ entries: s.entries.map((e) => (e.id === id ? fromEntry(data) : e)) }))
      })
  },

  deleteEntry: (id) => {
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
    supabase.from('entries').delete().eq('id', id)
  },

  // Publish an entry: marks it published AND creates a live copy for performance tracking
  publishEntry: (entry, onLiveCreated) => {
    supabase
      .from('entries')
      .insert([{
        idea_id:     entry.ideaId || null,
        title:       entry.title,
        description: entry.description || '',
        date:        entry.date,
        entry_type:  'live',
        platforms:   ['youtube', 'tiktok', 'instagram'],
        performance: {},
      }])
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) console.error('CreatorFlow – create live copy failed:', error)
        if (data) {
          const liveEntry = fromEntry(data)
          set((s) => ({ entries: [liveEntry, ...s.entries] }))
          if (onLiveCreated) onLiveCreated(liveEntry)
        }
      })
  },

  moveEntry: (id, newDate) => {
    set((s) => ({ entries: s.entries.map((e) => (e.id === id ? { ...e, date: newDate } : e)) }))
    supabase.from('entries').update({ date: newDate }).eq('id', id)
  },

  updatePerformance: (entryId, platform, data) => {
    const entry = get().entries.find((e) => e.id === entryId)
    const newPerf = { ...(entry?.performance || {}), [platform]: data }
    set((s) => ({
      entries: s.entries.map((e) => (e.id === entryId ? { ...e, performance: newPerf } : e)),
    }))
    supabase.from('entries').update({ performance: newPerf }).eq('id', entryId)
  },
}))

export default useStore
