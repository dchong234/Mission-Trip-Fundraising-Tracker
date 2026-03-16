import Link from 'next/link'
import { Donation } from '@/types'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS, METHOD_LABELS } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface RecentDonationsProps {
  donations: Donation[]
}

export default function RecentDonations({ donations }: RecentDonationsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-gray-900">Recent Donations</h2>
        <Link href="/donations" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {donations.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-4xl mb-2">💸</p>
          <p className="text-gray-500 text-sm">No donations yet. Add your first one!</p>
          <Link href="/donations" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline">
            Add donation →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {donations.map((donation) => (
            <li key={donation.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {donation.is_anonymous
                    ? 'A'
                    : donation.donor?.full_name?.[0] ?? donation.donor_name_override?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {donation.is_anonymous
                      ? 'Anonymous'
                      : donation.donor?.full_name ?? donation.donor_name_override ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(donation.received_at)} · {METHOD_LABELS[donation.method]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(donation.amount)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[donation.status]}`}>
                  {STATUS_LABELS[donation.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
