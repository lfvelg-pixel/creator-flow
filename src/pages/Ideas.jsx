import { useState } from 'react'
import { Plus, Search, Trash2, CalendarPlus, Edit2 } from 'lucide-react'
import useStore from '../store/useStore'
import { IDEA_TYPES, PLATFORMS, format, parseISO } from '../utils/dateUtils'
import AddIdeaModal from '../components/modals/AddIdeaModal'
import ScheduleIdeaModal from '../components/modals/ScheduleIdeaModal'
import PlatformBadge from '../components/PlatformBadge'

const typeColors = {
  idea: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  script: 'bg-blue-100 text-blue-700 border border-blue-200',
  recipe: 'bg-green-100 text-green-700 border border-green-200',
}

export default function Ideas() {
  const { ideas, deleteIdea } = useStore()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { type: 'add'|'edit'|'schedule', idea? }

  const filtered = ideas.filter((idea) => {
    const matchType = filter === 'all' || idea.type === filter
    const matchSearch =
      !search ||
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const typeInfo = (type) => IDEA_TYPES.find((t) => t.id === type)

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">💡 Ideas Bank</h1>
          <p className="text-gray-400 font-semibold mt-1">
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''} stored
          </p>
        </div>
        <button onClick={() => setModal({ type: 'add' })} className="btn-primary">
          <Plus size={18} />
          New Idea
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all
              ${filter === 'all'
                ? 'border-coral-400 bg-coral-50 text-coral-600'
                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
              }`}
          >
            All
          </button>
          {IDEA_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all
                ${filter === t.id
                  ? 'border-coral-400 bg-coral-50 text-coral-600'
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">{search ? '🔍' : '🌱'}</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">
            {search ? 'No ideas found' : 'Your ideas bank is empty'}
          </h3>
          <p className="text-gray-400 font-semibold mb-6">
            {search
              ? 'Try a different search term'
              : 'Start capturing your content ideas, scripts, and recipes here.'}
          </p>
          {!search && (
            <button onClick={() => setModal({ type: 'add' })} className="btn-primary">
              <Plus size={18} /> Add Your First Idea
            </button>
          )}
        </div>
      )}

      {/* Ideas grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((idea) => {
            const t = typeInfo(idea.type)
            return (
              <div
                key={idea.id}
                className="card flex flex-col gap-3 hover:shadow-card-hover transition-shadow group"
              >
                {/* Type + date */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${typeColors[idea.type]}`}>
                    {t?.emoji} {t?.label}
                  </span>
                  <span className="text-xs text-gray-300 font-semibold">
                    {format(parseISO(idea.createdAt), 'MMM d')}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-black text-gray-900 text-lg leading-tight">
                  {idea.title}
                </h3>

                {/* Description */}
                {idea.description && (
                  <p className="text-sm text-gray-500 font-semibold leading-relaxed line-clamp-2">
                    {idea.description}
                  </p>
                )}

                {/* Notes preview */}
                {idea.notes && (
                  <div className="bg-warm-gray rounded-xl p-3">
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed line-clamp-3">
                      {idea.notes}
                    </p>
                  </div>
                )}

                {/* Platforms */}
                {idea.platforms?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {idea.platforms.map((p) => (
                      <PlatformBadge key={p} platform={p} />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setModal({ type: 'schedule', idea })}
                    className="btn-primary flex-1 justify-center text-sm py-2"
                  >
                    <CalendarPlus size={15} />
                    Schedule
                  </button>
                  <button
                    onClick={() => setModal({ type: 'edit', idea })}
                    className="btn-ghost p-2.5"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="btn-ghost p-2.5 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'add' && (
        <AddIdeaModal onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <AddIdeaModal idea={modal.idea} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'schedule' && (
        <ScheduleIdeaModal idea={modal.idea} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
