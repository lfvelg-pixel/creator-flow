import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Calendar, Lightbulb, Zap, Layers, CheckCircle2, Loader2, WifiOff, Scissors } from 'lucide-react'
import useStore from '../store/useStore'

const navItems = [
  { to: '/',         label: 'Home',     icon: Home      },
  { to: '/workflow', label: 'Workflow', icon: Layers    },
  { to: '/calendar', label: 'Calendar', icon: Calendar  },
  { to: '/editing',  label: 'Editing',  icon: Scissors  },
  { to: '/ideas',    label: 'Ideas',    icon: Lightbulb },
]

// ── Save indicator ─────────────────────────────────────────────────────────
function SaveIndicator() {
  const syncStatus = useStore((s) => s.syncStatus)

  useEffect(() => {
    if (syncStatus !== 'saved') return
    const t = setTimeout(() => useStore.setState({ syncStatus: 'idle' }), 3000)
    return () => clearTimeout(t)
  }, [syncStatus])

  const configs = {
    idle: {
      icon: <CheckCircle2 size={14} />,
      label: 'All changes saved',
      className: 'bg-green-50 border-green-200 text-green-600',
    },
    saving: {
      icon: <Loader2 size={14} className="animate-spin" />,
      label: 'Saving...',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    },
    saved: {
      icon: <CheckCircle2 size={14} />,
      label: 'All changes saved',
      className: 'bg-green-50 border-green-200 text-green-600',
    },
    error: {
      icon: <WifiOff size={14} />,
      label: 'Not saved — check connection',
      className: 'bg-red-50 border-red-200 text-red-600',
    },
  }

  const c = configs[syncStatus] ?? configs.idle

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2
                  rounded-xl border-2 font-bold text-xs shadow-card
                  transition-all duration-300 ${c.className}`}
    >
      {c.icon}
      <span className="hidden sm:inline">{c.label}</span>
    </div>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SaveIndicator />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-white border-r border-coral-100 flex-col">
        {/* Logo */}
        <div className="p-5 pb-4 border-b border-coral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-coral-gradient flex items-center justify-center shadow-sm">
              <Zap size={18} className="text-white" fill="white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-gray-900 leading-none block">
                Creator
              </span>
              <span className="font-display text-xl font-bold leading-none text-coral-400">
                Flow
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 pt-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                 ${isActive
                   ? 'bg-coral-gradient text-white shadow-sm'
                   : 'text-gray-500 hover:bg-warm-gray hover:text-gray-800'
                 }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-coral-50">
          <p className="text-xs text-gray-300 font-semibold text-center">
            Made for creators ✨
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-coral-100 flex items-center px-4 h-14 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-coral-gradient flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-lg font-bold text-gray-900 leading-none">Creator</span>
            <span className="font-display text-lg font-bold leading-none text-coral-400">Flow</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-coral-100 flex">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors
               ${isActive ? 'text-coral-500' : 'text-gray-400'}`
            }
          >
            <Icon size={20} />
            <span className="text-xs font-bold">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
