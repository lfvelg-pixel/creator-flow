import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import {
  getWeekDays,
  toDateStr,
  format,
  isToday,
  isSameDay,
  parseISO,
  DAY_LABELS,
  ENTRY_TYPES,
  isDelayed,
} from '../utils/dateUtils'
import AddEntryModal from '../components/modals/AddEntryModal'
import PerformanceModal from '../components/modals/PerformanceModal'
import ContentCard from '../components/ContentCard'

export default function Home() {
  const navigate = useNavigate()
  const { entries, deleteEntry } = useStore()
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState(null) // { type: 'add'|'perf', date?, entry?, platform? }

  const today = new Date()
  const baseDate = new Date(today)
  baseDate.setDate(today.getDate() + weekOffset * 7)
  const weekDays = getWeekDays(baseDate)

  const weekStart = weekDays[0]
  const weekEnd = weekDays[6]

  const getEntriesForDay = (day) =>
    entries.filter((e) => {
      try { return isSameDay(parseISO(e.date), day) } catch { return false }
    })

  const totalThisWeek = weekDays.reduce(
    (sum, day) => sum + getEntriesForDay(day).length,
    0,
  )

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            {greeting()}, Creator! 👋
          </h1>
          <p className="text-gray-400 font-semibold mt-1">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'add' })}
          className="btn-primary"
        >
          <Plus size={18} />
          New Entry
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-4xl font-black text-coral-400">{totalThisWeek}</div>
          <div className="text-sm font-bold text-gray-400 mt-1">Entries This Week</div>
        </div>
        <div className="card text-center">
          <div className="text-4xl font-black text-green-400">
            {entries.filter((e) => e.entryType === 'live').length}
          </div>
          <div className="text-sm font-bold text-gray-400 mt-1">🚀 Live Total</div>
        </div>
        <div className="card text-center">
          <div className="text-4xl font-black text-red-400">
            {entries.filter((e) => isDelayed(e)).length}
          </div>
          <div className="text-sm font-bold text-gray-400 mt-1">⚠️ Delayed</div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-gray-800">
          {weekOffset === 0
            ? 'This Week'
            : weekOffset === 1
            ? 'Next Week'
            : weekOffset === -1
            ? 'Last Week'
            : `Week of ${format(weekStart, 'MMM d')}`}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((o) => o - 1)} className="btn-ghost p-2">
            <ChevronLeft size={18} />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="btn-ghost text-sm px-3"
            >
              Today
            </button>
          )}
          <button onClick={() => setWeekOffset((o) => o + 1)} className="btn-ghost p-2">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Week date range */}
      <p className="text-sm font-semibold text-gray-400 mb-6">
        {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
      </p>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayEntries = getEntriesForDay(day)
          const todayFlag = isToday(day)
          return (
            <div key={day.toString()} className="flex flex-col gap-2">
              {/* Day header */}
              <div className={`text-center py-2 rounded-xl ${todayFlag ? 'bg-coral-gradient' : 'bg-warm-gray'}`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${todayFlag ? 'text-white/80' : 'text-gray-400'}`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-xl font-black ${todayFlag ? 'text-white' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* Entries */}
              <div className="flex flex-col gap-2 min-h-24">
                {dayEntries.length === 0 ? (
                  <button
                    onClick={() =>
                      setModal({ type: 'add', date: toDateStr(day) })
                    }
                    className="flex-1 border-2 border-dashed border-gray-100 rounded-xl text-gray-300 text-xs font-bold hover:border-coral-200 hover:text-coral-300 transition-colors flex items-center justify-center min-h-16"
                  >
                    <Plus size={16} />
                  </button>
                ) : (
                  <>
                    {dayEntries.map((entry) => (
                      <ContentCard
                        key={entry.id}
                        entry={entry}
                        compact
                        onDelete={() => deleteEntry(entry.id)}
                        onTrack={(platform) =>
                          setModal({ type: 'perf', entry, platform })
                        }
                        onEdit={() =>
                          setModal({ type: 'edit', entry })
                        }
                      />
                    ))}
                    <button
                      onClick={() =>
                        setModal({ type: 'add', date: toDateStr(day) })
                      }
                      className="border-2 border-dashed border-gray-100 rounded-xl text-gray-300 text-xs font-bold hover:border-coral-200 hover:text-coral-300 transition-colors flex items-center justify-center py-2"
                    >
                      <Plus size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tip when no entries */}
      {totalThisWeek === 0 && (
        <div className="text-center mt-16">
          <div className="text-6xl mb-4">🗓️</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">Nothing scheduled yet</h3>
          <p className="text-gray-400 font-semibold mb-6">
            Add your first entry or head to Ideas to schedule content.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setModal({ type: 'add' })} className="btn-primary">
              <Plus size={18} /> Add Entry
            </button>
            <button onClick={() => navigate('/ideas')} className="btn-secondary">
              💡 Browse Ideas
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'add' && (
        <AddEntryModal
          date={modal.date}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'edit' && (
        <AddEntryModal
          entry={modal.entry}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'perf' && (
        <PerformanceModal
          entry={modal.entry}
          platform={modal.platform}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
