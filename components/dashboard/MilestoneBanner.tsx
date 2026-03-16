import Link from 'next/link'
import { Milestone } from '@/types'
import { formatCurrency, daysUntil } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface MilestoneBannerProps {
  milestones: Milestone[]
}

export default function MilestoneBanner({ milestones }: MilestoneBannerProps) {
  const upcoming = milestones
    .filter((m) => !m.is_completed && daysUntil(m.due_date) >= 0)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]

  if (!upcoming) return null

  const days = daysUntil(upcoming.due_date)
  const urgent = days <= 3
  const warning = days <= 7

  if (!warning) return null

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
        urgent
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}
    >
      {urgent ? (
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
      ) : (
        <Clock className="w-5 h-5 mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          Upcoming: {upcoming.title}
          {days === 0 ? ' — Today!' : ` — in ${days} day${days === 1 ? '' : 's'}`}
        </p>
        {upcoming.target_amount && (
          <p className="text-xs mt-0.5 opacity-80">
            Target: {formatCurrency(upcoming.target_amount)} by {upcoming.due_date}
          </p>
        )}
      </div>
      <Link
        href="/milestones"
        className={`text-xs font-medium shrink-0 ${urgent ? 'text-red-700 hover:text-red-900' : 'text-yellow-700 hover:text-yellow-900'}`}
      >
        View →
      </Link>
    </div>
  )
}
