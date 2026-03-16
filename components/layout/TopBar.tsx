'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Plane, LogOut, LayoutDashboard, DollarSign, Users, Gift, Target, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donations', label: 'Donations', icon: DollarSign },
  { href: '/donors', label: 'Donors', icon: Users },
  { href: '/gifts', label: 'Supporter Gifts', icon: Gift },
  { href: '/milestones', label: 'Milestones', icon: Target },
  { href: '/ai', label: 'AI Tools', icon: Sparkles },
]

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Mission Trip Tracker</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop topbar (sign out only) */}
      <div className="hidden lg:flex items-center justify-end px-6 py-3 border-b border-slate-200 bg-white">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">Mission Trip</h1>
                <p className="text-xs text-gray-500">Fundraising Tracker</p>
              </div>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', active ? 'text-indigo-600' : 'text-gray-400')} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-4 left-3 right-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
