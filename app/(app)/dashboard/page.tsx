import { createClient } from '@/lib/supabase/server'
import ThermometerChart from '@/components/dashboard/ThermometerChart'
import StatsGrid from '@/components/dashboard/StatsGrid'
import RecentDonations from '@/components/dashboard/RecentDonations'
import MilestoneBanner from '@/components/dashboard/MilestoneBanner'
import MotivationalQuote from '@/components/dashboard/MotivationalQuote'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [profileRes, summaryRes, donationsRes, milestonesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('fundraising_summary').select('*').eq('user_id', user.id).single(),
    supabase
      .from('donations')
      .select('*, donor:donors(id, full_name, email)')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })
      .limit(5),
    supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('due_date', { ascending: true }),
  ])

  const profile = profileRes.data
  const summary = summaryRes.data
  const donations = donationsRes.data ?? []
  const milestones = milestonesRes.data ?? []
  const goalAmount = profile?.goal_amount ?? 3600
  const totalReceived = summary?.total_received ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {profile?.trip_name ?? 'Mission Trip'} · Here&apos;s your progress
          </p>
        </div>
        <Link
          href="/donations"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Donation
        </Link>
      </div>

      {/* Milestone Banner */}
      <MilestoneBanner milestones={milestones} />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thermometer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <h2 className="font-semibold text-gray-900 mb-6 self-start">Fundraising Progress</h2>
          <ThermometerChart current={totalReceived} goal={goalAmount} />
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Raised</span>
              <span className="font-semibold text-green-600">${totalReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining</span>
              <span className="font-semibold text-gray-900">
                ${Math.max(0, goalAmount - totalReceived).toLocaleString()}
              </span>
            </div>
            {(summary?.total_pledged ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pledged</span>
                <span className="font-semibold text-yellow-600">${summary!.total_pledged.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <StatsGrid summary={summary} profile={profile} />
          <MotivationalQuote />
        </div>
      </div>

      {/* Recent Donations */}
      <RecentDonations donations={donations} />
    </div>
  )
}
