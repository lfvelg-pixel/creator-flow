import { useState } from 'react'
import { X } from 'lucide-react'
import useStore from '../../store/useStore'
import { PLATFORMS, IDEA_TYPES } from '../../utils/dateUtils'

export default function AddIdeaModal({ idea, onClose }) {
  const { addIdea, updateIdea } = useStore()
  const isEdit = Boolean(idea)

  const [form, setForm] = useState({
    title: idea?.title || '',
    description: idea?.description || '',
    type: idea?.type || 'idea',
    platforms: idea?.platforms || [],
    notes: idea?.notes || '',
  })

  const togglePlatform = (id) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(id)
        ? f.platforms.filter((p) => p !== id)
        : [...f.platforms, id],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (isEdit) {
      updateIdea(idea.id, form)
    } else {
      addIdea(form)
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">
            {isEdit ? '✏️ Edit Idea' : '💡 New Idea'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {IDEA_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all
                    ${form.type === t.id
                      ? 'border-coral-400 bg-coral-50 text-coral-600'
                      : 'border-gray-100 bg-warm-gray text-gray-400 hover:border-gray-200'
                    }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="What's the idea?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              placeholder="What's this about? Hook, angle, key points..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Notes / Script */}
          <div>
            <label className="label">Full Notes / Script</label>
            <textarea
              className="input resize-none"
              placeholder="Write your full script, recipe steps, or detailed notes here..."
              rows={5}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="label">Target Platforms</label>
            <div className="flex gap-3">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2
                    ${form.platforms.includes(p.id)
                      ? 'border-coral-400 bg-coral-50 text-coral-600'
                      : 'border-gray-100 bg-warm-gray text-gray-400 hover:border-gray-200'
                    }`}
                >
                  <span>{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {isEdit ? 'Save Changes' : 'Save Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
