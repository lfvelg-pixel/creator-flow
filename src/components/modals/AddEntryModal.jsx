import { useState } from 'react'
import { X } from 'lucide-react'
import useStore from '../../store/useStore'
import { ENTRY_TYPES, format, parseISO } from '../../utils/dateUtils'

const SELECTABLE_TYPES = ENTRY_TYPES

export default function AddEntryModal({ date, entry, onClose }) {
  const { addEntry, updateEntry } = useStore()
  const isEdit = Boolean(entry)

  const [form, setForm] = useState({
    title: entry?.title || '',
    description: entry?.description || '',
    entryType: entry?.entryType || 'idea',
    date: entry?.date || date || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.date) return
    if (isEdit) {
      updateEntry(entry.id, form)
    } else {
      addEntry(form)
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {isEdit ? '✏️ Edit Entry' : '➕ New Entry'}
            </h2>
            {form.date && (
              <p className="text-sm text-gray-400 font-semibold mt-0.5">
                {format(parseISO(form.date), 'EEEE, MMMM d')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          {!date && (
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="What are you creating?"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input resize-none"
              placeholder="Any details, links, or reminders..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Stage */}
          <div>
            <label className="label">Stage</label>
            <div className="grid grid-cols-3 gap-2">
              {SELECTABLE_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, entryType: t.id }))}
                  className={`py-2.5 rounded-xl font-bold text-sm border-2 transition-all
                    ${form.entryType === t.id
                      ? 'border-coral-400 bg-coral-50 text-coral-600'
                      : 'border-gray-100 bg-warm-gray text-gray-400 hover:border-gray-200'
                    }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-semibold mt-2">
              📢 All platforms (YouTube, TikTok, Instagram) are tracked automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              {isEdit ? 'Save Changes' : 'Add to Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
