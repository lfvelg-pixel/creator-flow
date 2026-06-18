import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  eachDayOfInterval,
  isWithinInterval,
  isBefore,
  format,
  isToday,
  isSameDay,
  isSameMonth,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns'

export {
  format,
  isToday,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfDay,
  isWithinInterval,
  parseISO,
  addMonths,
  subMonths,
}

export function getWeekDays(date = new Date()) {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  })
}

export function getCalendarDays(date = new Date()) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: calStart, end: calEnd })
}

export function toDateStr(date) {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateStr(str) {
  return parseISO(str)
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', color: '#FF0000', emoji: '▶️' },
  { id: 'tiktok', label: 'TikTok', color: '#FE2C55', emoji: '🎵' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C', emoji: '📸' },
]

export const ENTRY_TYPES = [
  { id: 'idea',      label: 'Idea',      emoji: '💡', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'recording', label: 'Recording', emoji: '🎬', color: 'bg-purple-100 text-purple-700' },
  { id: 'editing',   label: 'Editing',   emoji: '✂️', color: 'bg-blue-100 text-blue-700'    },
  { id: 'scheduled', label: 'Scheduled', emoji: '📅', color: 'bg-orange-100 text-orange-700' },
  { id: 'published', label: 'Published', emoji: '📢', color: 'bg-teal-100 text-teal-700'    },
  { id: 'live',      label: 'Live',      emoji: '🚀', color: 'bg-green-100 text-green-700'  },
]

export const STAGE_ORDER = ['idea', 'recording', 'editing', 'scheduled', 'published', 'live']

export function isDelayed(entry) {
  if (entry.entryType !== 'idea' && entry.entryType !== 'recording') return false
  try {
    return isBefore(parseISO(entry.date), startOfDay(new Date()))
  } catch {
    return false
  }
}

export const IDEA_TYPES = [
  { id: 'idea', label: 'Idea', emoji: '💡' },
  { id: 'script', label: 'Script', emoji: '📝' },
  { id: 'recipe', label: 'Recipe', emoji: '🍳' },
]

export const PERFORMANCE_FIELDS = [
  { id: 'views', label: 'Views', emoji: '👁️' },
  { id: 'likes', label: 'Likes', emoji: '❤️' },
  { id: 'comments', label: 'Comments', emoji: '💬' },
  { id: 'shares', label: 'Shares', emoji: '🔗' },
  { id: 'followersGained', label: 'Followers Gained', emoji: '➕' },
]
