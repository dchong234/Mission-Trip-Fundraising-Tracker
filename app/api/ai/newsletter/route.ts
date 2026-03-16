import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, buildNewsletterPrompt } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { month, highlight } = body

    const [profileRes, summaryRes, recentDonRes, milestonesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('fundraising_summary').select('*').eq('user_id', user.id).single(),
      supabase
        .from('donations')
        .select('amount, received_at')
        .eq('user_id', user.id)
        .eq('status', 'received')
        .gte('received_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('received_at', { ascending: false }),
      supabase
        .from('milestones')
        .select('title, due_date')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
        .limit(3),
    ])

    const profile = profileRes.data
    const summary = summaryRes.data

    const prompt = buildNewsletterPrompt({
      month: month ?? new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      tripName: profile?.trip_name ?? 'Mission Trip',
      currentTotal: summary?.total_received ?? 0,
      goalAmount: profile?.goal_amount ?? 3600,
      donorCount: summary?.unique_donor_count ?? 0,
      recentDonations: recentDonRes.data ?? [],
      upcomingMilestones: milestonesRes.data ?? [],
      highlight,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    await supabase.from('ai_messages').insert({
      user_id: user.id,
      type: 'newsletter',
      prompt_context: { month, highlight },
      generated_text: text,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error('AI newsletter error:', error)
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
  }
}
