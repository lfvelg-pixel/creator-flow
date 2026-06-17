import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const genId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

const useStore = create(
  persist(
    (set) => ({
      ideas: [],
      entries: [],

      // ── Ideas ──────────────────────────────────────────────
      addIdea: (idea) =>
        set((state) => ({
          ideas: [
            ...state.ideas,
            { ...idea, id: genId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateIdea: (id, updates) =>
        set((state) => ({
          ideas: state.ideas.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      deleteIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),

      // ── Calendar Entries ───────────────────────────────────
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: genId(),
              platforms: ['youtube', 'tiktok', 'instagram'],
              performance: {},
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

      moveEntry: (id, newDate) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, date: newDate } : e,
          ),
        })),

      updatePerformance: (entryId, platform, data) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? { ...e, performance: { ...e.performance, [platform]: data } }
              : e,
          ),
        })),
    }),
    { name: 'creatorflow-v1' },
  ),
)

export default useStore
