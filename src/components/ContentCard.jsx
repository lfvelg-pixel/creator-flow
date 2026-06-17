import { Trash2, BarChart2, GripVertical } from 'lucide-react'
import { ENTRY_TYPES, PLATFORMS, isDelayed } from '../utils/dateUtils'

const DELAYED_BADGE = { emoji: '⚠️', label: 'Delayed', color: 'bg-red-100 text-red-600' }

export default function ContentCard({
  entry,
  onDelete,
  onTrack,
  onEdit,
  isDragging = false,
  dragHandleProps = {},
  compact = false,
}) {
  const delayed = isDelayed(entry)
  const typeInfo = delayed
    ? DELAYED_BADGE
    : ENTRY_TYPES.find((t) => t.id === entry.entryType) || ENTRY_TYPES[0]

  const isLive = entry.entryType === 'live'
  const hasPerformance = Object.keys(entry.performance || {}).length > 0

  return (
    <div
      className={`bg-white rounded-xl border-2 shadow-card transition-all
        ${isDragging ? 'opacity-40 scale-95' : 'hover:shadow-card-hover'}
        ${delayed ? 'border-red-100' : 'border-coral-100 hover:border-coral-300'}
        ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="text-gray-300 cursor-grab active:cursor-grabbing mt-0.5 flex-shrink-0"
        >
          <GripVertical size={14} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Stage badge */}
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg mb-1 ${typeInfo.color}`}>
            {typeInfo.emoji} {typeInfo.label}
          </span>

          {/* Title */}
          <p
            className={`font-bold text-gray-800 leading-tight truncate cursor-pointer hover:text-coral-500 transition-colors ${compact ? 'text-xs' : 'text-sm'}`}
            onClick={onEdit}
          >
            {entry.title}
          </p>

          {/* Performance indicator */}
          {hasPerformance && (
            <div className="mt-1 flex items-center gap-1 text-xs text-green-600 font-semibold">
              <BarChart2 size={11} />
              <span>Stats tracked</span>
            </div>
          )}

          {/* Platform track buttons — only when Live */}
          {isLive && !compact && (
            <div className="flex flex-wrap gap-1 mt-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onTrack?.(p.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg
                             bg-warm-gray text-gray-500 hover:bg-coral-50 hover:text-coral-600 transition-colors"
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
