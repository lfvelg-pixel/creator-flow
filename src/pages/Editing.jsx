import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import useStore from '../store/useStore'
import { format, parseISO } from '../utils/dateUtils'

const CHECKLIST_ITEMS = [
  { id: 'videoReady',    label: 'Video Ready',    emoji: '🎥' },
  { id: 'scriptReady',   label: 'Script Ready',   emoji: '📝' },
  { id: 'ingredients',   label: 'Ingredients',    emoji: '🛒' },
  { id: 'voiceRecorded', label: 'Voice Recorded', emoji: '🎙️' },
  { id: 'captions',      label: 'Captions',       emoji: '💬' },
]

const DEFAULT_CL = { videoReady: false, scriptReady: false, ingredients: false, voiceRecorded: false, captions: false }

export default function Editing() {
  const { entries, updateEntry } = useStore()
  const [filter, setFilter] = useState('all')

  const editingEntries = entries
    .filter((e) => e.entryType === 'editing')
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  const getCl   = (e) => e.editingChecklist || DEFAULT_CL
  const doneCount = (e) => CHECKLIST_ITEMS.filter((i) => getCl(e)[i.id]).length
  const isReady = (e) => doneCount(e) === CHECKLIST_ITEMS.length

  const filteredEntries =
    filter === 'all'   ? editingEntries :
    filter === 'ready' ? editingEntries.filter(isReady) :
    editingEntries.filter((e) => getCl(e)[filter])

  const hasCount   = (itemId) => editingEntries.filter((e) =>  getCl(e)[itemId]).length
  const readyCount = editingEntries.filter(isReady).length

  const FILTERS = [
    { id: 'all',   label: 'All',          emoji: '📋', count: editingEntries.length },
    { id: 'ready', label: 'Ready',         emoji: '✅', count: readyCount            },
    ...CHECKLIST_ITEMS.map((item) => ({ ...item, count: hasCount(item.id) })),
  ]

  if (editingEntries.length === 0) {
    return (
      <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✂️</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">Nothing in editing yet</h3>
          <p className="text-gray-400 font-semibold text-sm">
            Move entries to Editing from the Workflow or Calendar pages.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">✂️ Editing</h1>
        <p className="text-gray-400 font-semibold mt-1 text-sm">
          {editingEntries.length} videos in editing · {readyCount} ready to schedule
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-6">
        <div className="card text-center p-3">
          <div className="text-xl md:text-2xl font-black text-blue-500">{editingEntries.length}</div>
          <div className="text-xs font-bold text-gray-400 mt-0.5">Total</div>
        </div>
        <div className="card text-center p-3 bg-green-50 border-green-100">
          <div className="text-xl md:text-2xl font-black text-green-500">{readyCount}</div>
          <div className="text-xs font-bold text-gray-400 mt-0.5">✅ Ready</div>
        </div>
        {CHECKLIST_ITEMS.map((item) => {
          const missing = editingEntries.length - hasCount(item.id)
          return (
            <div
              key={item.id}
              className={`card text-center p-3 ${missing > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}
            >
              <div className={`text-xl md:text-2xl font-black ${missing > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {missing}
              </div>
              <div className="text-xs font-bold text-gray-400 mt-0.5 leading-tight">{item.emoji} Missing</div>
            </div>
          )
        })}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl font-bold text-sm border-2 transition-all flex items-center gap-1.5
              ${filter === f.id
                ? f.id === 'ready'
                  ? 'bg-green-500 text-white border-transparent shadow-sm'
                  : 'bg-coral-gradient text-white border-transparent shadow-sm'
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
              }`}
          >
            {f.emoji} {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-black
              ${filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty filter state */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-lg font-black text-gray-700 mb-1">
            {filter === 'ready' ? 'Nothing fully ready yet' : `No videos have ${CHECKLIST_ITEMS.find(i => i.id === filter)?.label} yet`}
          </h3>
          <p className="text-gray-400 font-semibold text-sm">Check the boxes on your videos below.</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map((entry) => {
          const cl    = getCl(entry)
          const done  = doneCount(entry)
          const pct   = (done / CHECKLIST_ITEMS.length) * 100
          const ready = isReady(entry)

          let dateLabel = ''
          try { dateLabel = format(parseISO(entry.date), 'MMM d') } catch {}

          const progressColor =
            pct === 100 ? 'bg-green-400' :
            pct >= 60   ? 'bg-yellow-400' :
            pct >= 30   ? 'bg-orange-400' :
                          'bg-red-400'

          return (
            <div
              key={entry.id}
              className={`card flex flex-col gap-4 border-2 transition-all hover:shadow-card-hover
                ${ready ? 'border-green-200 bg-green-50/20' : 'border-coral-100'}`}
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
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

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Progress</span>
                  <span className="text-xs font-black text-blue-500">{done}/{CHECKLIST_ITEMS.length}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div className="flex flex-col gap-2">
                {CHECKLIST_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      updateEntry(entry.id, {
                        editingChecklist: { ...cl, [item.id]: !cl[item.id] },
                      })
                    }
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 font-bold text-sm
                                text-left transition-all duration-150
                      ${cl[item.id]
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-warm-gray border-gray-100 text-gray-500 hover:border-blue-200 hover:bg-blue-50/40'
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${cl[item.id] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}
                    >
                      {cl[item.id] && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

              {/* CTA */}
              {ready ? (
                <button
                  onClick={() => updateEntry(entry.id, { entryType: 'scheduled' })}
                  className="btn-primary justify-center w-full mt-auto"
                >
                  Move to 📅 Scheduled <ArrowRight size={15} />
                </button>
              ) : (
                <p className="text-center text-xs font-bold text-gray-400 mt-auto pt-1">
                  {CHECKLIST_ITEMS.length - done} item{CHECKLIST_ITEMS.length - done !== 1 ? 's' : ''} still missing
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
