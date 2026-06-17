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
  idea:      { header: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400', count: 'bg-yellow-100 text-yellow-700' },
  recording: { header: 'bg-purple-50 border-purple-200',  dot: 'bg-purple-400', count: 'bg-purple-100 text-purple-700' },
  delayed:   { header: 'bg-red-50    border-red-200',     dot: 'bg-red-400',    count: 'bg-red-100    text-red-700'    },
  editing:   { header: 'bg-blue-50   border-blue-200',    dot: 'bg-blue-400',   count: 'bg-blue-100   text-blue-700'  },
  scheduled: { header: 'bg-orange-50 border-orange-200',  dot: 'bg-orange-400', count: 'bg-orange-100 text-orange-700' },
  live:      { header: 'bg-green-50  border-green-200',   dot: 'bg-green-400',  count: 'bg-green-100  text-green-700' },
}

// ── Single workflow card ───────────────────────────────────────────────────
function WorkflowCard({ entry, columnId, onAdvance, onRestore, onDelete, onTrack, onEdit }) {
  const isLive = entry.entryType === 'live'
  const delayed = columnId === 'delayed'
  const hasPerf = Object.keys(entry.performance || {}).length > 0
  const nextStage = ENTRY_TYPES[STAGE_ORDER.indexOf(isLive ? 'live' : entry.entryType) + 1]

  let dateLabel = ''
  try { dateLabel = format(parseISO(entry.date), 'MMM d') } catch {}

  return (
    <div className={`bg-white rounded-2xl border-2 p-4 shadow-card flex flex-col gap-3 transition-all hover:shadow-card-hover
      ${delayed ? 'border-red-100' : 'border-gray-100'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
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

      {/* Performance stats summary (if live and has data) */}
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
        {/* Live: track per platform */}
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
                    <span className="hidden sm:inline">{p.label}</span>
                    {tracked && <span className="text-green-500">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Delayed: restore button */}
        {delayed && (
          <button
            onClick={onRestore}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold
                       bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <RotateCcw size={13} /> Reschedule
          </button>
        )}

        {/* Advance stage */}
        {!isLive && !delayed && nextStage && (
          <button
            onClick={onAdvance}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold
                       bg-coral-50 text-coral-600 border border-coral-200 hover:bg-coral-100 transition-colors"
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
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 ${s.header}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
          <span className="font-black text-gray-800 text-sm">{col.emoji} {col.label}</span>
        </div>
        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${s.count}`}>
          {col.entries.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {col.entries.length === 0 ? (
          <div className="border-2 border-dashed border-gray-100 rounded-2xl py-8 text-center text-gray-300 text-xs font-bold">
            Nothing here yet
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Workflow() {
  const { entries, updateEntry, deleteEntry } = useStore()
  const [modal, setModal] = useState(null)

  const weekDays = getWeekDays(new Date())
  const weekInterval = { start: weekDays[0], end: weekDays[6] }

  const isThisWeek = (entry) => {
    try { return isWithinInterval(parseISO(entry.date), weekInterval) } catch { return false }
  }

  const columns = [
    {
      id: 'idea',
      label: 'Ideas',
      emoji: '💡',
      entries: entries.filter((e) => e.entryType === 'idea' && !isDelayed(e)),
    },
    {
      id: 'recording',
      label: 'Recording This Week',
      emoji: '🎬',
      entries: entries.filter((e) => e.entryType === 'recording' && !isDelayed(e)),
    },
    {
      id: 'delayed',
      label: 'Delayed',
      emoji: '⚠️',
      entries: entries.filter((e) => isDelayed(e)),
    },
    {
      id: 'editing',
      label: 'Editing',
      emoji: '✂️',
      entries: entries.filter((e) => e.entryType === 'editing'),
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      emoji: '📅',
      entries: entries.filter((e) => e.entryType === 'scheduled'),
    },
    {
      id: 'live',
      label: 'Live',
      emoji: '🚀',
      entries: entries.filter((e) => e.entryType === 'live'),
    },
  ]

  const advanceStage = (entry) => {
    const idx = STAGE_ORDER.indexOf(entry.entryType)
    if (idx < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[idx + 1]
      updateEntry(entry.id, { entryType: nextStage })
      if (nextStage === 'live') {
        // Auto-open the Go Live modal so user can immediately track performance
        setModal({ type: 'golive', entry: { ...entry, entryType: 'live' } })
      }
    }
  }

  const totalEntries = entries.length
  const liveCount   = entries.filter((e) => e.entryType === 'live').length
  const delayedCount = entries.filter((e) => isDelayed(e)).length

  return (
    <div className="p-8 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">📋 Workflow</h1>
        <p className="text-gray-400 font-semibold mt-1">
          Track every piece of content from idea to live
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="bg-white border border-coral-100 rounded-xl px-4 py-2 shadow-card">
          <span className="text-sm font-black text-gray-800">{totalEntries}</span>
          <span className="text-xs font-bold text-gray-400 ml-1.5">total entries</span>
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
      </div>

      {/* Kanban board */}
      {totalEntries === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-black text-gray-700 mb-2">No content in the pipeline yet</h3>
            <p className="text-gray-400 font-semibold">
              Add entries from the Calendar or Ideas pages to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <Column key={col.id} col={col}>
              {col.entries.map((entry) => (
                <WorkflowCard
                  key={entry.id}
                  entry={entry}
                  columnId={col.id}
                  onAdvance={() => advanceStage(entry)}
                  onRestore={() => setModal({ type: 'edit', entry })}
                  onDelete={() => deleteEntry(entry.id)}
                  onTrack={(platform) => setModal({ type: 'perf', entry, platform })}
                  onEdit={() => setModal({ type: 'edit', entry })}
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

// ── Go Live celebration modal ───────────────────────────────────────────────
function GoLiveModal({ entry, onTrack, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="p-8 text-center">
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-2">
            <X size={18} />
          </button>

          {/* Celebration */}
          <div className="text-6xl mb-3">🚀</div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">It's Live!</h2>
          <p className="text-gray-500 font-semibold mb-2 text-sm">
            "{entry.title}"
          </p>
          <p className="text-gray-400 font-semibold mb-8 text-sm">
            Track how it performed on each platform below.
          </p>

          {/* Platform buttons */}
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
