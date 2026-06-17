import { PLATFORMS } from '../utils/dateUtils'

const platformStyles = {
  youtube: 'bg-red-100 text-red-600 border border-red-200',
  tiktok: 'bg-pink-100 text-pink-600 border border-pink-200',
  instagram: 'bg-purple-100 text-purple-600 border border-purple-200',
}

export default function PlatformBadge({ platform, size = 'sm' }) {
  const p = PLATFORMS.find((x) => x.id === platform)
  if (!p) return null
  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-bold ${sizeClass} ${platformStyles[platform]}`}>
      <span>{p.emoji}</span>
      {size !== 'xs' && <span>{p.label}</span>}
    </span>
  )
}
