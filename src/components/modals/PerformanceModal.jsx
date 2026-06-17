import { useState } from 'react'
import { X, TrendingUp } from 'lucide-react'
import useStore from '../../store/useStore'
import { PLATFORMS, PERFORMANCE_FIELDS } from '../../utils/dateUtils'

export default function PerformanceModal({ entry, platform, onClose }) {
  const { updatePerformance } = useStore()
  const platformInfo = PLATFORMS.find((p) => p.id === platform)
  const existing = entry.performance?.[platform] || {}

  const [form, setForm] = useState({
    views: existing.views || '',
    likes: existing.likes || '',
    comments: existing.comments || '',
    shares: existing.shares || '',
    followersGained: existing.followersGained || '',
    postedAt: existing.postedAt || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleaned = {}
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '') cleaned[k] = k === 'postedAt' ? v : Number(v)
    })
    updatePerformance(entry.id, platform, cleaned)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-coral-400" />
              Track Performance
            </h2>
            <p className="text-sm text-gray-400 font-semibold mt-1">
              {platformInfo?.emoji} {platformInfo?.label} · {entry.title}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {PERFORMANCE_FIELDS.map((field) => (
              <div key={field.id}>
                <label className="label">
                  {field.emoji} {field.label}
                </label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="0"
                  value={form[field.id]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.id]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="col-span-2">
              <label className="label">⏰ Time Posted</label>
              <input
                type="time"
                className="input"
                value={form.postedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postedAt: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Show existing totals if any */}
          {Object.keys(existing).length > 0 && (
            <div className="mt-5 p-4 bg-warm-gray rounded-xl">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Previously Saved
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PERFORMANCE_FIELDS.filter((f) => existing[f.id]).map((f) => (
                  <div key={f.id} className="text-center">
                    <div className="text-lg font-black text-coral-500">
                      {existing[f.id]?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              Save Stats
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
