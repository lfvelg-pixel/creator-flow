import { useState } from 'react'
import { Trash2, ArrowRight, BarChart2, RotateCcw, X } from 'lucide-react'
import useStore from '../store/useStore'
import {
  ENTRY_TYPES,
  PLATFORMS,
  STAGE_ORDER,
  isDelayed,
  format,
  parseISO,
  getWeekDays,
  isWithinInterval,
} from '../utils/dateUtils'
import PerformanceModal from '../components/modals/PerformanceModal'
import AddEntryModal from '../components/modals/AddEntryModal'

// ── Column colour map ──────────────────────────────────────────────────────
const COL_STYLES = {
  idea:      { header: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400', count: 'bg-yellow-100 text-yellow-700'  },
  recording: { header: 'bg-purple-50 border-purple-200',  dot: 'bg-purple-400', count: 'bg-purple-100 text-purple-700'  },
  editing:   { header: 'bg-blue-50   border-blue-200',    dot: 'bg-blue-400',   count: 'bg-blue-100   text-blue-700'    },
  scheduled: { header: 'bg-orange-50 border-orange-200',  dot: 'bg-orange-400', count: 'bg-orange-100 text-orange-700'  },
  published: { header: 'bg-teal-50   border-teal-200',    dot: 'bg-teal-400',   count: 'bg-teal-100   text-teal-700'    },
  live:      { header: 'bg-green-50  border-green-200',   dot: 'bg-green-400',  count: 'bg-green-100  text-green-700'   },
}

// ── Editing checklist ──────────────────────────────────────────────────────
const CHECKLIST_ITEMS = [
  { id: 'scriptReady',   label: 'Script Ready',   emoji: '📝' },
  { id: 'ingredients',   label: 'Ingredients',    emoji: '🛒' },
  { id: 'voiceRecorded', label: 'Voice Recorded', emoji: '🎙️' },
  { id: 'captions',      label: 'Captions',       emoji: '💬' },
]

function EditingChecklist({ checklist, onChange }) {
  const cl = checklist || { scriptReady: false, ingredients: false, voiceRecorded: false, captions: false }
  const doneCount = CHECKLIST_ITEMS.filter((i) => cl[i.id]).length

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Checklist</span>
        <span className="text-xs font-black text-blue-500">{doneCount}/{CHECKLIST_ITEMS.length}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-300"
          style={{ width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%` }}
        />
      </div>
      {CHECKLIST_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange({ ...cl, [item.id]: !cl[item.id] })}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 font-bold text-sm
                      text-left transition-all duration-150
            ${cl[item.id]
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-warm-gray border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/40'
            }`}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
            ${cl[item.id] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}
          >
            {cl[item.id] && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span>{item.emoji} {item.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Workflow card ──────────────────────────────────────────────────────────
function WorkflowCard({ entry, onAdvance, onDelete, onTrack, onEdit, onChecklistChange }) {
  const isLive  = entry.entryType === 'live'
  const delayed = isDelayed(entry)
  const hasPerf = Object.keys(entry.performance || {}).length > 0

  const currentIdx = STAGE_ORDER.indexOf(entry.entryType)
  const nextStage  = currentIdx >= 0 && currentIdx < STAGE_ORDER.length - 1
    ? ENTRY_TYPES.find((t) => t.id === STAGE_ORDER[currentIdx + 1])
    : null

  const isMovingToLive = nextStage?.id === 'live'

  let dateLabel = ''
  try { dateLabel = format(parseISO(entry.date), 'MMM d') } catch {}

  return (
    <div className={`bg-white rounded-2xl border-2 p-4 shadow-card flex flex-col gap-3 transition-all hover:shadow-card-hover
      ${delayed ? 'border-red-200' : isLive ? 'border-green-100' : 'border-gray-100'}`}
    >
      {/* Title + date */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {delayed && (
            <span className="text-xs font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg mb-1 inline-block">
              ⚠️ Delayed
            </span>
          )}
          <p
            className="font-black text-gray-900 text-sm leading-snug cursor-pointer hover:text-coral-500 transition-colors"
            onClick={onEdit}
          >
            {entry.title}
          </p>
          {dateLabel && (
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{dateLabel}</p>
          )}
        </div>
        <button onClick={onDelete} className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Description */}
      {entry.description && (
        <p className="text-xs text-gray-400 font-semibold leading-relaxed line-clamp-2">
          {entry.description}
        </p>
      )}

      {/* Editing checklist */}
      {entry.entryType === 'editing' && (
        <EditingChecklist
          checklist={entry.editingChecklist}
          onChange={onChecklistChange}
        />
      )}

      {/* Live: performance stats summary */}
      {isLive && hasPerf && (
        <div className="bg-green-50 rounded-xl p-3 flex flex-wrap gap-x-4 gap-y-1">
          {PLATFORMS.map((p) => {
            const perf = entry.performance?.[p.id]
            if (!perf) return null
            return (
              <div key={p.id} className="text-xs font-bold text-green-700">
                {p.emoji} {perf.views != null ? `${Number(perf.views).toLocaleString()} views` : 'tracked'}
              </div>
            )
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">

        {/* Live: track per-platform */}
        {isLive && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <BarChart2 size={11} /> Track Performance
            </p>
            <div className="flex gap-1.5">
              {PLATFORMS.map((p) => {
                const tracked = Boolean(entry.performance?.[p.id])
                return (
                  <button
                    key={p.id}
                    onClick={() => onTrack(p.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1
                      ${tracked
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-warm-gray border-gray-100 text-gray-500 hover:bg-coral-50 hover:border-coral-200 hover:text-coral-600'
                      }`}
                  >
                    {p.emoji}
                    <span>{p.label}</span>
                    {tracked && <span className="text-green-500">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Delayed: reschedule */}
        {delayed && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold
                       bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <RotateCcw size={13} /> Reschedule
          </button>
        )}

        {/* Advance to next stage */}
        {!isLive && !delayed && nextStage && (
          <button
            onClick={onAdvance}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors
              ${isMovingToLive
                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                : 'bg-coral-50 text-coral-600 border border-coral-200 hover:bg-coral-100'
              }`}
          >
            Move to {nextStage.emoji} {nextStage.label}
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Column ─────────────────────────────────────────────────────────────────
function Column({ col, children }) {
  const s = COL_STYLES[col.id] || COL_STYLES.idea
  return (
    <div className="flex-shrink-0 w-64 flex flex-col gap-3">
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 ${s.header}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
          <span className="font-black text-gray-800 text-sm">{col.emoji} {col.label}</span>
        </div>
        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${s.count}`}>
          {col.entries.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {col.entries.length === 0 ? (
          <div className="border-2 border-dashed border-gray-100 rounded-2xl py-8 text-center text-gray-300 text-xs font-bold">
            Nothing here yet
          </div>
        ) : children}
      </div>
    </div>
  )
}

// ── Go Live modal ──────────────────────────────────────────────────────────
function GoLiveModal({ entry, onTrack, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box relative">
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-2">
          <X size={18} />
        </button>
        <div className="p-8 text-center">
          <div className="text-6xl mb-3">🚀</div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">It's Live!</h2>
          <p className="text-gray-500 font-semibold mb-1 text-sm">"{entry.title}"</p>
          <p className="text-gray-400 font-semibold mb-8 text-sm">
            Track how it performs on each platform:
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onTrack('youtube')}
              className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-red-100
                         bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all group"
            >
              <span className="text-2xl">▶️</span>
              <div className="text-left flex-1">
                <p className="font-black text-red-700">YouTube</p>
                <p className="text-xs text-red-400 font-semibold">Views, likes, comments, shares, subscribers</p>
              </div>
              <ArrowRight size={18} className="text-red-300 group-hover:text-red-500 transition-colors" />
            </button>
            <button
              onClick={() => onTrack('tiktok')}
              className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-pink-100
                         bg-pink-50 hover:bg-pink-100 hover:border-pink-300 transition-all group"
            >
              <span className="text-2xl">🎵</span>
              <div className="text-left flex-1">
                <p className="font-black text-pink-700">TikTok</p>
                <p className="text-xs text-pink-400 font-semibold">Views, likes, comments, shares, followers</p>
              </div>
              <ArrowRight size={18} className="text-pink-300 group-hover:text-pink-500 transition-colors" />
            </button>
            <button
              onClick={() => onTrack('instagram')}
              className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-purple-100
                         bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all group"
            >
              <span className="text-2xl">📸</span>
              <div className="text-left flex-1">
                <p className="font-black text-purple-700">Instagram</p>
                <p className="text-xs text-purple-400 font-semibold">Views, likes, comments, shares, followers</p>
              </div>
              <ArrowRight size={18} className="text-purple-300 group-hover:text-purple-500 transition-colors" />
            </button>
          </div>
          <button onClick={onClose} className="btn-ghost w-full justify-center mt-4 text-sm">
            I'll track this later
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Editing dashboard view ─────────────────────────────────────────────────
function EditingView({ entries, updateEntry, onAdvanceToScheduled }) {
  const editingEntries = entries.filter((e) => e.entryType === 'editing')

  const getCl   = (e) => e.editingChecklist || { scriptReady: false, ingredients: false, voiceRecorded: false, captions: false }
  const done    = (e) => CHECKLIST_ITEMS.filter((i) => getCl(e)[i.id]).length
  const isReady = (e) => done(e) === CHECKLIST_ITEMS.length

  const readyCount   = editingEntries.filter(isReady).length
  const missingStats = CHECKLIST_ITEMS.map((item) => ({
    ...item,
    missing: editingEntries.filter((e) => !getCl(e)[item.id]).length,
  }))

  if (editingEntries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">Nothing in editing yet</h3>
          <p className="text-gray-400 font-semibold">Move entries to Editing from the Pipeline view.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center col-span-1">
          <div className="text-3xl font-black text-blue-500">{editingEntries.length}</div>
          <div className="text-xs font-bold text-gray-400 mt-1">In Editing</div>
        </div>
        <div className="card text-center col-span-1">
          <div className="text-3xl font-black text-green-500">{readyCount}</div>
          <div className="text-xs font-bold text-gray-400 mt-1">✅ Fully Ready</div>
        </div>
        {missingStats.map((item) => (
          <div
            key={item.id}
            className={`card text-center col-span-1 transition-colors
              ${item.missing > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
          >
            <div className={`text-3xl font-black ${item.missing > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {item.missing}
            </div>
            <div className="text-xs font-bold text-gray-400 mt-1">
              {item.emoji} Missing {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {editingEntries.map((entry) => {
          const cl    = getCl(entry)
          const pct   = (done(entry) / CHECKLIST_ITEMS.length) * 100
          const ready = isReady(entry)

          let dateLabel = ''
          try { dateLabel = format(parseISO(entry.date), 'MMM d') } catch {}

          const progressColor = pct === 100
            ? 'bg-green-400' : pct >= 66
            ? 'bg-yellow-400' : pct >= 33
            ? 'bg-orange-400'
            : 'bg-red-400'

          return (
            <div
              key={entry.id}
              className={`card flex flex-col gap-4 border-2 transition-all hover:shadow-card-hover
                ${ready ? 'border-green-200 bg-green-50/20' : 'border-coral-100'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-black text-gray-900 text-base leading-snug">{entry.title}</h3>
                  {dateLabel && (
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{dateLabel}</p>
                  )}
                </div>
                {ready && (
                  <span className="bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0">
                    ✅ Ready!
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Progress</span>
                  <span className="text-xs font-black text-blue-500">{done(entry)}/{CHECKLIST_ITEMS.length}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      updateEntry(entry.id, { editingChecklist: { ...cl, [item.id]: !cl[item.id] } })
                    }
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 font-bold text-sm
                                text-left transition-all duration-150
                      ${cl[item.id]
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-warm-gray border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/40'
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${cl[item.id] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}
                    >
                      {cl[item.id] && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{item.emoji} {item.label}</span>
                    {!cl[item.id] && (
                      <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-lg">
                        Missing
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {ready ? (
                <button
                  onClick={() => onAdvanceToScheduled(entry)}
                  className="btn-primary justify-center w-full mt-auto"
                >
                  Move to 📅 Scheduled <ArrowRight size={15} />
                </button>
              ) : (
                <p className="text-center text-xs font-bold text-gray-400 mt-auto pt-1">
                  {CHECKLIST_ITEMS.length - done(entry)} item{CHECKLIST_ITEMS.length - done(entry) !== 1 ? 's' : ''} still missing
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Filter tabs ────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all',           label: 'All',             emoji: '📋' },
  { id: 'this-week',     label: 'This Week',        emoji: '📅' },
  { id: 'pipeline',      label: 'Pipeline',         emoji: '🔄' },
  { id: 'editing',       label: 'Editing',          emoji: '✂️' },
  { id: 'published-live', label: 'Published & Live', emoji: '📢' },
]

// ── Main page ──────────────────────────────────────────────────────────────
export default function Workflow() {
  const { entries, updateEntry, deleteEntry } = useStore()
  const [modal, setModal]   = useState(null)
  const [filter, setFilter] = useState('all')

  const byDate = (a, b) => (a.date || '').localeCompare(b.date || '')

  const allColumns = [
    {
      id: 'idea',
      label: 'Ideas',
      emoji: '💡',
      entries: entries.filter((e) => e.entryType === 'idea').sort(byDate),
    },
    {
      id: 'recording',
      label: 'Recording',
      emoji: '🎬',
      entries: entries.filter((e) => e.entryType === 'recording').sort(byDate),
    },
    {
      id: 'editing',
      label: 'Editing',
      emoji: '✂️',
      entries: entries.filter((e) => e.entryType === 'editing').sort(byDate),
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      emoji: '📅',
      entries: entries.filter((e) => e.entryType === 'scheduled').sort(byDate),
    },
    {
      id: 'published',
      label: 'Published',
      emoji: '📢',
      entries: entries.filter((e) => e.entryType === 'published').sort(byDate),
    },
    {
      id: 'live',
      label: 'Live',
      emoji: '🚀',
      entries: entries.filter((e) => e.entryType === 'live').sort(byDate),
    },
  ]

  let visibleColumns = allColumns
  if (filter === 'pipeline') {
    visibleColumns = allColumns.filter((c) => !['published', 'live'].includes(c.id))
  } else if (filter === 'published-live') {
    visibleColumns = allColumns.filter((c) => ['published', 'live'].includes(c.id))
  } else if (filter === 'this-week') {
    const weekDays = getWeekDays(new Date())
    const interval = { start: weekDays[0], end: weekDays[6] }
    visibleColumns = allColumns.map((col) => ({
      ...col,
      entries: col.entries.filter((e) => {
        try { return isWithinInterval(parseISO(e.date), interval) }
        catch { return false }
      }),
    }))
  }

  const advanceStage = (entry) => {
    const idx = STAGE_ORDER.indexOf(entry.entryType)
    if (idx >= 0 && idx < STAGE_ORDER.length - 1) {
      const nextType = STAGE_ORDER[idx + 1]
      updateEntry(entry.id, { entryType: nextType })
      if (nextType === 'live') {
        setModal({ type: 'golive', entry: { ...entry, entryType: 'live' } })
      }
    }
  }

  const totalEntries   = entries.filter((e) => e.entryType !== 'live').length
  const liveCount      = entries.filter((e) => e.entryType === 'live').length
  const publishedCount = entries.filter((e) => e.entryType === 'published').length
  const delayedCount   = entries.filter(isDelayed).length

  return (
    <div className="p-8 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">📋 Workflow</h1>
        <p className="text-gray-400 font-semibold mt-1">
          Track every piece of content from idea to live
        </p>
      </div>

      {/* Stats + Filter row */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Stats pills */}
        <div className="bg-white border border-coral-100 rounded-xl px-4 py-2 shadow-card">
          <span className="text-sm font-black text-gray-800">{totalEntries}</span>
          <span className="text-xs font-bold text-gray-400 ml-1.5">total</span>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2">
          <span className="text-sm font-black text-teal-700">{publishedCount}</span>
          <span className="text-xs font-bold text-teal-500 ml-1.5">📢 published</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <span className="text-sm font-black text-green-700">{liveCount}</span>
          <span className="text-xs font-bold text-green-500 ml-1.5">🚀 live</span>
        </div>
        {delayedCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            <span className="text-sm font-black text-red-700">{delayedCount}</span>
            <span className="text-xs font-bold text-red-500 ml-1.5">⚠️ delayed</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1" />

        {/* Filter tabs */}
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all
              ${filter === f.id
                ? 'bg-coral-gradient text-white border-transparent shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
              }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-black text-gray-700 mb-2">No content in the pipeline yet</h3>
            <p className="text-gray-400 font-semibold">Add entries from the Calendar or Ideas pages to get started.</p>
          </div>
        </div>
      ) : filter === 'editing' ? (
        <EditingView
          entries={entries}
          updateEntry={updateEntry}
          onAdvanceToScheduled={(entry) => updateEntry(entry.id, { entryType: 'scheduled' })}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {visibleColumns.map((col) => (
            <Column key={col.id} col={col}>
              {col.entries.map((entry) => (
                <WorkflowCard
                  key={entry.id}
                  entry={entry}
                  onAdvance={() => advanceStage(entry)}
                  onDelete={() => deleteEntry(entry.id)}
                  onTrack={(platform) => setModal({ type: 'perf', entry, platform })}
                  onEdit={() => setModal({ type: 'edit', entry })}
                  onChecklistChange={(cl) => updateEntry(entry.id, { editingChecklist: cl })}
                />
              ))}
            </Column>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'edit' && (
        <AddEntryModal entry={modal.entry} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'perf' && (
        <PerformanceModal
          entry={modal.entry}
          platform={modal.platform}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'golive' && (
        <GoLiveModal
          entry={modal.entry}
          onTrack={(platform) => setModal({ type: 'perf', entry: modal.entry, platform })}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
