import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, buildThankYouPrompt } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { donorId, personalNote } = body
    if (!donorId) return NextResponse.json({ error: 'donorId is required' }, { status: 400 })

    const [profileRes, summaryRes, donorTotalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('fundraising_summary').select('*').eq('user_id', user.id).single(),
      supabase.from('donor_totals').select('*').eq('donor_id', donorId).single(),
    ])

    const profile = profileRes.data
    const summary = summaryRes.data
    const donorTotal = donorTotalRes.data

    if (!donorTotal) return NextResponse.json({ error: 'Donor not found' }, { status: 404 })

    const prompt = buildThankYouPrompt({
      donorName: donorTotal.full_name,
      amount: donorTotal.total_received,
      tripName: profile?.trip_name ?? 'Mission Trip',
      currentTotal: summary?.total_received ?? 0,
      goalAmount: profile?.goal_amount ?? 3600,
      personalNote,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    await supabase.from('ai_messages').insert({
      user_id: user.id,
      donor_id: donorId,
      type: 'thank_you',
      prompt_context: { donorId, personalNote },
      generated_text: text,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error('AI thank-you error:', error)
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
  }
}
