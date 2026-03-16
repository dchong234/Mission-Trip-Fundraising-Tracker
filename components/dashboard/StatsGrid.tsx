import { formatCurrency, daysUntil } from '@/lib/utils'
import { FundraisingSummary, Profile } from '@/types'
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react'

interface StatsGridProps {
  summary: FundraisingSummary | null
  profile: Profile | null
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function StatsGrid({ summary, profile }: StatsGridProps) {
  const totalReceived = summary?.total_received ?? 0
  const totalPledged = summary?.total_pledged ?? 0
  const donorCount = summary?.unique_donor_count ?? 0
  const donationCount = summary?.donation_count ?? 0
  const avgDonation = donationCount > 0 ? totalReceived / donationCount : 0
  const daysLeft = profile?.departure_date ? daysUntil(profile.departure_date) : null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Amount Raised"
        value={formatCurrency(totalReceived)}
        sub={totalPledged > 0 ? `+${formatCurrency(totalPledged)} pledged` : undefined}
        icon={DollarSign}
        color="bg-green-100 text-green-600"
      />
      <StatCard
        label="Donors"
        value={donorCount.toString()}
        sub={`${donationCount} total donations`}
        icon={Users}
        color="bg-blue-100 text-blue-600"
      />
      <StatCard
        label="Avg Donation"
        value={formatCurrency(avgDonation)}
        sub="per donation received"
        icon={TrendingUp}
        color="bg-purple-100 text-purple-600"
      />
      <StatCard
        label="Days Until Trip"
        value={daysLeft !== null ? (daysLeft > 0 ? daysLeft.toString() : 'Trip Day!') : '—'}
        sub={profile?.departure_date ? `Departs ${profile.departure_date}` : 'No date set'}
        icon={Calendar}
        color="bg-orange-100 text-orange-600"
      />
    </div>
  )
}
