import { useState } from 'react'
import { X, CalendarCheck } from 'lucide-react'
import useStore from '../../store/useStore'
import { ENTRY_TYPES, PLATFORMS, format, parseISO } from '../../utils/dateUtils'

export default function ScheduleIdeaModal({ idea, onClose }) {
  const { addEntry } = useStore()
  const [form, setForm] = useState({
    date: '',
    entryType: 'recording',
    platforms: idea.platforms || [],
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
    if (!form.date) return
    addEntry({
      ideaId: idea.id,
      title: idea.title,
      description: idea.description,
      date: form.date,
      entryType: form.entryType,
      platforms: form.platforms,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <CalendarCheck size={20} className="text-coral-400" />
              Schedule Idea
            </h2>
            <p className="text-sm text-gray-400 font-semibold mt-1 truncate max-w-xs">
              "{idea.title}"
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label">📅 Date *</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Type</label>
            <div className="flex gap-3">
              {ENTRY_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, entryType: t.id }))}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all
                    ${form.entryType === t.id
                      ? 'border-coral-400 bg-coral-50 text-coral-600'
                      : 'border-gray-100 bg-warm-gray text-gray-400 hover:border-gray-200'
                    }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Platforms</label>
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
              Add to Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
