import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, buildPacePrompt } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [profileRes, summaryRes, recentDonRes, milestonesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('fundraising_summary').select('*').eq('user_id', user.id).single(),
      supabase
        .from('donations')
        .select('amount, received_at')
        .eq('user_id', user.id)
        .eq('status', 'received')
        .order('received_at', { ascending: false })
        .limit(10),
      supabase
        .from('milestones')
        .select('title, due_date, target_amount')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
        .limit(5),
    ])

    const profile = profileRes.data
    const summary = summaryRes.data
    const recentDonations = recentDonRes.data ?? []
    const milestones = milestonesRes.data ?? []

    const goalAmount = profile?.goal_amount ?? 3600
    const currentTotal = summary?.total_received ?? 0
    const gap = Math.max(0, goalAmount - currentTotal)

    // Calculate daily rate from first to last donation
    const firstDate = summary?.first_donation_date
    const lastDate = summary?.last_donation_date
    let dailyRate = 0
    let daysRemaining = 0

    if (firstDate && lastDate && currentTotal > 0) {
      const daySpan = Math.max(1, (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24))
      dailyRate = currentTotal / daySpan
    }

    if (profile?.departure_date) {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const departure = new Date(profile.departure_date + 'T00:00:00')
      daysRemaining = Math.max(0, Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    const projectedTotal = currentTotal + (dailyRate * daysRemaining)
    const isOnTrack = projectedTotal >= goalAmount

    const prompt = buildPacePrompt({
      currentTotal,
      goalAmount,
      daysRemaining,
      dailyRate,
      projectedTotal,
      recentDonations,
      upcomingMilestones: milestones,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const advice = message.content[0].type === 'text' ? message.content[0].text : ''

    await supabase.from('ai_messages').insert({
      user_id: user.id,
      type: 'pace_report',
      prompt_context: { dailyRate, projectedTotal, daysRemaining },
      generated_text: advice,
    })

    return NextResponse.json({
      daily_rate: dailyRate,
      projected_total: projectedTotal,
      days_remaining: daysRemaining,
      gap_to_goal: gap,
      is_on_track: isOnTrack,
      advice,
    })
  } catch (error) {
    console.error('AI pace error:', error)
    return NextResponse.json({ error: 'Failed to analyze pace' }, { status: 500 })
  }
}
