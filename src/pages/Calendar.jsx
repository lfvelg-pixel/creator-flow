import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import useStore from '../store/useStore'
import {
  getCalendarDays,
  toDateStr,
  format,
  isToday,
  isSameDay,
  isSameMonth,
  parseISO,
  addMonths,
  subMonths,
  DAY_LABELS,
} from '../utils/dateUtils'
import ContentCard from '../components/ContentCard'
import AddEntryModal from '../components/modals/AddEntryModal'
import PerformanceModal from '../components/modals/PerformanceModal'

// ── Draggable entry card ────────────────────────────────────────────────────
function DraggableCard({ entry, onDelete, onTrack, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ContentCard
        entry={entry}
        compact
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onDelete={onDelete}
        onTrack={onTrack}
        onEdit={onEdit}
      />
    </div>
  )
}

// ── Droppable day cell ──────────────────────────────────────────────────────
function DroppableDay({ day, isCurrentMonth, dayEntries, onAdd, onDelete, onTrack, onEdit }) {
  const dateStr = toDateStr(day)
  const { setNodeRef, isOver } = useDroppable({ id: dateStr })
  const todayFlag = isToday(day)

  return (
    <div
      ref={setNodeRef}
      className={`min-h-28 p-1.5 rounded-xl border-2 transition-colors flex flex-col gap-1
        ${isOver ? 'border-coral-300 bg-coral-50' : 'border-transparent'}
        ${!isCurrentMonth ? 'opacity-40' : ''}
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between px-1">
        <span
          className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-black
            ${todayFlag
              ? 'bg-coral-gradient text-white shadow-sm'
              : 'text-gray-600 hover:bg-warm-gray'
            }`}
        >
          {format(day, 'd')}
        </span>
        <button
          onClick={() => onAdd(dateStr)}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md bg-coral-100 text-coral-400
                     hover:bg-coral-200 flex items-center justify-center transition-all"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-1">
        {dayEntries.map((entry) => (
          <DraggableCard
            key={entry.id}
            entry={entry}
            onDelete={() => onDelete(entry.id)}
            onTrack={(platform) => onTrack(entry, platform)}
            onEdit={() => onEdit(entry)}
          />
        ))}
      </div>

      {/* Add button on hover / when empty */}
      {dayEntries.length === 0 && (
        <button
          onClick={() => onAdd(dateStr)}
          className="flex-1 flex items-center justify-center text-gray-200 hover:text-coral-300
                     hover:bg-coral-50 rounded-lg transition-colors text-xs"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  )
}

// ── Main Calendar page ──────────────────────────────────────────────────────
export default function Calendar() {
  const { entries, deleteEntry, moveEntry } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modal, setModal] = useState(null)
  const [activeEntry, setActiveEntry] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const calDays = getCalendarDays(currentDate)

  const getEntriesForDay = (day) =>
    entries.filter((e) => {
      try { return isSameDay(parseISO(e.date), day) } catch { return false }
    })

  const handleDragStart = ({ active }) => {
    setActiveEntry(entries.find((e) => e.id === active.id) || null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveEntry(null)
    if (over && active.id !== over.id) {
      moveEntry(active.id, over.id)
    }
  }

  return (
    <div className="p-4 md:p-8 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <p className="text-gray-400 font-semibold mt-0.5">
            {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-ghost text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
            className="btn-ghost p-2"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
            className="btn-ghost p-2"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setModal({ type: 'add' })}
            className="btn-primary"
          >
            <Plus size={18} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-black text-gray-400 uppercase tracking-wider py-2">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-7 gap-1 flex-1 group">
          {calDays.map((day) => (
            <DroppableDay
              key={toDateStr(day)}
              day={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              dayEntries={getEntriesForDay(day)}
              onAdd={(dateStr) => setModal({ type: 'add', date: dateStr })}
              onDelete={deleteEntry}
              onTrack={(entry, platform) =>
                setModal({ type: 'perf', entry, platform })
              }
              onEdit={(entry) => setModal({ type: 'edit', entry })}
            />
          ))}
        </div>

        <DragOverlay>
          {activeEntry && (
            <div className="opacity-90 scale-105 shadow-modal rounded-xl">
              <ContentCard entry={activeEntry} compact />
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
