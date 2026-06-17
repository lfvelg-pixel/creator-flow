import { NavLink } from 'react-router-dom'
import { Home, Calendar, Lightbulb, Zap, Layers } from 'lucide-react'

const navItems = [
  { to: '/',         label: 'Home',     icon: Home      },
  { to: '/workflow', label: 'Workflow', icon: Layers    },
  { to: '/calendar', label: 'Calendar', icon: Calendar  },
  { to: '/ideas',    label: 'Ideas',    icon: Lightbulb },
]

export default function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-coral-100 flex flex-col">
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
