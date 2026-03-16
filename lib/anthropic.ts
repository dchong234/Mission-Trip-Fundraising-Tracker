import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export function buildSolicitationPrompt(params: {
  donorName: string
  relationship: string
  tone: string
  tripName: string
  goalAmount: number
  currentTotal: number
  departureDate: string | null
  context?: string
}): string {
  const pct = Math.round((params.currentTotal / params.goalAmount) * 100)
  const toneGuide = {
    warm: 'warm, heartfelt, and personal',
    formal: 'professional and respectful',
    playful: 'upbeat, fun, and enthusiastic',
  }[params.tone] || 'warm and personal'

  return `You are helping a young person write a fundraising support letter for a mission trip.
Write a ${toneGuide} letter to ${params.donorName} (relationship: ${params.relationship}).

Context:
- Trip: ${params.tripName}
- Fundraising goal: $${params.goalAmount}
- Currently raised: $${params.currentTotal} (${pct}% of goal)
${params.departureDate ? `- Departure date: ${params.departureDate}` : ''}
${params.context ? `- Additional context: ${params.context}` : ''}

Write a genuine, personal 2-3 paragraph letter asking for their financial support.
Include: what the trip is for, what the student will do, the specific ask, and how to give.
Keep it under 250 words. Do NOT include placeholders — write it ready to send.
Start with "Dear ${params.donorName}," and end with a warm sign-off.`
}

export function buildThankYouPrompt(params: {
  donorName: string
  amount: number
  tripName: string
  currentTotal: number
  goalAmount: number
  personalNote?: string
}): string {
  return `Write a heartfelt, genuine thank-you letter from a mission trip participant to a donor.

Context:
- Donor: ${params.donorName}
- Their gift: $${params.amount}
- Trip: ${params.tripName}
- Total raised so far: $${params.currentTotal} of $${params.goalAmount} goal
${params.personalNote ? `- Personal note: ${params.personalNote}` : ''}

Write 2 paragraphs expressing genuine gratitude. Mention:
1. The specific impact of their gift on the fundraising progress
2. What this trip means and how their support is part of something bigger

Keep it under 150 words. Warm, sincere, not overly formal.
Start with "Dear ${params.donorName}," and sign off warmly.`
}

export function buildNewsletterPrompt(params: {
  month: string
  tripName: string
  currentTotal: number
  goalAmount: number
  donorCount: number
  recentDonations: Array<{ amount: number; received_at: string }>
  upcomingMilestones: Array<{ title: string; due_date: string }>
  highlight?: string
}): string {
  const pct = Math.round((params.currentTotal / params.goalAmount) * 100)
  const recentSum = params.recentDonations.reduce((s, d) => s + d.amount, 0)

  return `Write a monthly newsletter update from a mission trip participant to their sponsors.

Month: ${params.month}
Trip: ${params.tripName}
Fundraising progress: $${params.currentTotal} raised of $${params.goalAmount} goal (${pct}%)
Total supporters: ${params.donorCount} donors
Recent donations this period: $${recentSum} from ${params.recentDonations.length} gifts
${params.upcomingMilestones.length > 0 ? `Upcoming deadlines: ${params.upcomingMilestones.map(m => `${m.title} by ${m.due_date}`).join(', ')}` : ''}
${params.highlight ? `Special highlight: ${params.highlight}` : ''}

Write a 3-paragraph newsletter update that:
1. Updates sponsors on fundraising progress with genuine excitement
2. Shares what the student has been doing to prepare for the trip
3. Includes a specific prayer request or encouragement for sponsors

Tone: authentic, grateful, youthful but not immature. 200-300 words. No placeholders.
Start with a subject line, then the newsletter body.`
}

export function buildPacePrompt(params: {
  currentTotal: number
  goalAmount: number
  daysRemaining: number
  dailyRate: number
  projectedTotal: number
  recentDonations: Array<{ amount: number; received_at: string }>
  upcomingMilestones: Array<{ title: string; due_date: string; target_amount: number | null }>
}): string {
  const gap = params.goalAmount - params.currentTotal
  const onTrack = params.projectedTotal >= params.goalAmount

  return `Analyze this student's mission trip fundraising pace and give specific, actionable, encouraging advice.

Current status:
- Raised: $${params.currentTotal} of $${params.goalAmount} goal
- Gap remaining: $${gap}
- Days remaining: ${params.daysRemaining}
- Current daily rate: $${params.dailyRate.toFixed(2)}/day
- Projected total at current rate: $${params.projectedTotal.toFixed(0)}
- On track: ${onTrack ? 'YES' : 'NO'}
- Recent donations (last entries): ${params.recentDonations.slice(0, 5).map(d => `$${d.amount} on ${d.received_at}`).join(', ') || 'None recently'}
${params.upcomingMilestones.length > 0 ? `Upcoming milestones: ${params.upcomingMilestones.map(m => `"${m.title}"${m.target_amount ? ` ($${m.target_amount} target)` : ''} by ${m.due_date}`).join('; ')}` : ''}

Write 2-3 paragraphs of specific, actionable coaching advice. Include:
1. An honest assessment of where they stand (encouraging but truthful)
2. Specific numbers: e.g., "You need X more donors averaging $Y" or "Send Z follow-up messages this week"
3. 2-3 concrete next steps they can take TODAY

Tone: like a supportive coach. Be direct, specific, and encouraging. No fluff.`
}
