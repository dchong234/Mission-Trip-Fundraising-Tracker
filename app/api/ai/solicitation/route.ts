import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { anthropic, buildSolicitationPrompt } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { donorName, relationship, tone, context } = body

    if (!donorName) return NextResponse.json({ error: 'donorName is required' }, { status: 400 })

    // Get user profile and fundraising summary
    const [profileRes, summaryRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('fundraising_summary').select('*').eq('user_id', user.id).single(),
    ])

    const profile = profileRes.data
    const summary = summaryRes.data

    const prompt = buildSolicitationPrompt({
      donorName,
      relationship: relationship ?? 'friend',
      tone: tone ?? 'warm',
      tripName: profile?.trip_name ?? 'Mission Trip',
      goalAmount: profile?.goal_amount ?? 3600,
      currentTotal: summary?.total_received ?? 0,
      departureDate: profile?.departure_date ?? null,
      context,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to history
    await supabase.from('ai_messages').insert({
      user_id: user.id,
      type: 'solicitation',
      prompt_context: { donorName, relationship, tone },
      generated_text: text,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error('AI solicitation error:', error)
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
  }
}
