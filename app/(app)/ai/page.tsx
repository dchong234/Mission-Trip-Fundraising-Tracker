'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Donor, AIMessage } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Sparkles, Copy, Check, RefreshCw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type AITool = 'solicitation' | 'thankyou' | 'newsletter' | 'pace'

interface PaceAnalysis {
  daily_rate: number
  projected_total: number
  days_remaining: number
  gap_to_goal: number
  is_on_track: boolean
  advice: string
}

function MessageOutput({
  text,
  loading,
  onRegenerate,
}: {
  text: string
  loading: boolean
  onRegenerate: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="relative">
        <textarea
          readOnly
          value={loading ? 'Generating...' : text}
          rows={10}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 resize-none focus:outline-none"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">AI is writing...</span>
            </div>
          </div>
        )}
      </div>
      {text && !loading && (
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" /> Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

export default function AIPage() {
  const supabase = createClient()
  const [activeTool, setActiveTool] = useState<AITool | null>(null)
  const [donors, setDonors] = useState<Donor[]>([])
  const [history, setHistory] = useState<AIMessage[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)

  // Solicitation state
  const [solDonorName, setSolDonorName] = useState('')
  const [solRelationship, setSolRelationship] = useState('friend')
  const [solTone, setSolTone] = useState('warm')
  const [solContext, setSolContext] = useState('')
  const [solOutput, setSolOutput] = useState('')
  const [solLoading, setSolLoading] = useState(false)

  // Thank you state
  const [tyDonorId, setTyDonorId] = useState('')
  const [tyNote, setTyNote] = useState('')
  const [tyOutput, setTyOutput] = useState('')
  const [tyLoading, setTyLoading] = useState(false)

  // Newsletter state
  const [nlMonth, setNlMonth] = useState(() => {
    const d = new Date()
    return d.toLocaleString('default', { month: 'long', year: 'numeric' })
  })
  const [nlHighlight, setNlHighlight] = useState('')
  const [nlOutput, setNlOutput] = useState('')
  const [nlLoading, setNlLoading] = useState(false)

  // Pace state
  const [paceData, setPaceData] = useState<PaceAnalysis | null>(null)
  const [paceLoading, setPaceLoading] = useState(false)

  const fetchData = useCallback(async () => {
    const [donorsRes, histRes] = await Promise.all([
      supabase.from('donors').select('*').order('full_name'),
      supabase
        .from('ai_messages')
        .select('*, donor:donors(id, full_name)')
        .order('created_at', { ascending: false })
        .limit(10),
    ])
    setDonors(donorsRes.data ?? [])
    setHistory(histRes.data ?? [])
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  async function generateSolicitation() {
    setSolLoading(true)
    setSolOutput('')
    try {
      const res = await fetch('/api/ai/solicitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: solDonorName,
          relationship: solRelationship,
          tone: solTone,
          context: solContext,
        }),
      })
      const data = await res.json()
      setSolOutput(data.text ?? data.error ?? 'Error generating message')
    } catch {
      setSolOutput('Error connecting to AI service')
    }
    setSolLoading(false)
    fetchData()
  }

  async function generateThankYou() {
    if (!tyDonorId) return
    setTyLoading(true)
    setTyOutput('')
    try {
      const res = await fetch('/api/ai/thankyou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: tyDonorId, personalNote: tyNote }),
      })
      const data = await res.json()
      setTyOutput(data.text ?? data.error ?? 'Error generating message')
    } catch {
      setTyOutput('Error connecting to AI service')
    }
    setTyLoading(false)
    fetchData()
  }

  async function generateNewsletter() {
    setNlLoading(true)
    setNlOutput('')
    try {
      const res = await fetch('/api/ai/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: nlMonth, highlight: nlHighlight }),
      })
      const data = await res.json()
      setNlOutput(data.text ?? data.error ?? 'Error generating message')
    } catch {
      setNlOutput('Error connecting to AI service')
    }
    setNlLoading(false)
    fetchData()
  }

  async function analyzePace() {
    setPaceLoading(true)
    setPaceData(null)
    try {
      const res = await fetch('/api/ai/pace', { method: 'POST' })
      const data = await res.json()
      setPaceData(data)
    } catch {
      setPaceData(null)
    }
    setPaceLoading(false)
    fetchData()
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  const tools = [
    { id: 'solicitation' as AITool, label: 'Solicitation Letter', emoji: '✉️', desc: 'Ask someone to support your trip' },
    { id: 'thankyou' as AITool, label: 'Thank-You Note', emoji: '🙏', desc: 'Thank a donor for their gift' },
    { id: 'newsletter' as AITool, label: 'Newsletter Update', emoji: '📰', desc: 'Monthly update for all sponsors' },
    { id: 'pace' as AITool, label: 'Pace Predictor', emoji: '📊', desc: 'AI analysis of your fundraising pace' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" /> AI Tools
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">AI-powered tools to accelerate your fundraising</p>
      </div>

      {/* Tool Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTool === tool.id
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
            }`}
          >
            <div className="text-3xl mb-2">{tool.emoji}</div>
            <p className="font-semibold text-sm text-gray-900">{tool.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Tool Panels */}
      {activeTool === 'solicitation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">✉️ Solicitation Letter Generator</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Recipient Name *</label>
              <input
                value={solDonorName}
                onChange={e => setSolDonorName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Uncle Bob, Pastor Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Relationship</label>
                <select value={solRelationship} onChange={e => setSolRelationship(e.target.value)} className={inputClass}>
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="church">Church Member</option>
                  <option value="coworker">Coworker</option>
                  <option value="neighbor">Neighbor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tone</label>
                <select value={solTone} onChange={e => setSolTone(e.target.value)} className={inputClass}>
                  <option value="warm">Warm & Heartfelt</option>
                  <option value="formal">Professional</option>
                  <option value="playful">Upbeat & Fun</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Additional Context (optional)</label>
              <textarea
                value={solContext}
                onChange={e => setSolContext(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Any personal details to include? (e.g. 'They mentioned they went on a mission trip before')"
              />
            </div>
            <button
              onClick={generateSolicitation}
              disabled={solLoading || !solDonorName}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              {solLoading ? 'Writing...' : 'Generate Letter'}
            </button>
            {(solOutput || solLoading) && (
              <MessageOutput text={solOutput} loading={solLoading} onRegenerate={generateSolicitation} />
            )}
          </div>
        </div>
      )}

      {activeTool === 'thankyou' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">🙏 Thank-You Note Generator</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Select Donor *</label>
              <select value={tyDonorId} onChange={e => setTyDonorId(e.target.value)} className={inputClass}>
                <option value="">Choose a donor...</option>
                {donors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
              {donors.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Add donors first on the Donors page.</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Personal Note (optional)</label>
              <textarea
                value={tyNote}
                onChange={e => setTyNote(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Anything special to mention? (e.g. 'They always encouraged me at church')"
              />
            </div>
            <button
              onClick={generateThankYou}
              disabled={tyLoading || !tyDonorId}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              {tyLoading ? 'Writing...' : 'Generate Thank-You'}
            </button>
            {(tyOutput || tyLoading) && (
              <MessageOutput text={tyOutput} loading={tyLoading} onRegenerate={generateThankYou} />
            )}
          </div>
        </div>
      )}

      {activeTool === 'newsletter' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">📰 Newsletter Update Generator</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Month</label>
              <input value={nlMonth} onChange={e => setNlMonth(e.target.value)} className={inputClass} placeholder="March 2026" />
            </div>
            <div>
              <label className={labelClass}>Special Highlight (optional)</label>
              <textarea
                value={nlHighlight}
                onChange={e => setNlHighlight(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Any special update to mention? (e.g. 'I just finished my pre-trip training weekend')"
              />
            </div>
            <button
              onClick={generateNewsletter}
              disabled={nlLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
            >
              <Sparkles className="w-4 h-4" />
              {nlLoading ? 'Writing...' : 'Generate Newsletter'}
            </button>
            {(nlOutput || nlLoading) && (
              <MessageOutput text={nlOutput} loading={nlLoading} onRegenerate={generateNewsletter} />
            )}
          </div>
        </div>
      )}

      {activeTool === 'pace' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">📊 Pace Predictor</h2>
          <p className="text-sm text-gray-500 mb-4">
            AI analyzes your donation rate and tells you if you&apos;ll hit your goal — with specific advice on what to do next.
          </p>
          <button
            onClick={analyzePace}
            disabled={paceLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-xl text-sm font-semibold transition mb-4"
          >
            <Sparkles className="w-4 h-4" />
            {paceLoading ? 'Analyzing...' : 'Analyze My Pace'}
          </button>

          {paceLoading && (
            <div className="flex items-center gap-2 text-indigo-600 py-4">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">Analyzing your fundraising data...</span>
            </div>
          )}

          {paceData && !paceLoading && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Daily Rate</p>
                  <p className="font-bold text-gray-900">{formatCurrency(paceData.daily_rate)}/day</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Projected Total</p>
                  <p className="font-bold text-gray-900">{formatCurrency(paceData.projected_total)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Days Left</p>
                  <p className="font-bold text-gray-900">{paceData.days_remaining}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Gap to Goal</p>
                  <p className="font-bold text-gray-900">{formatCurrency(paceData.gap_to_goal)}</p>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${paceData.is_on_track ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {paceData.is_on_track
                  ? <TrendingUp className="w-5 h-5 shrink-0" />
                  : <TrendingDown className="w-5 h-5 shrink-0" />}
                <p className="font-semibold">
                  {paceData.is_on_track ? "You're on track to reach your goal!" : "You're currently behind pace to reach your goal."}
                </p>
              </div>

              {/* AI Advice */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Coaching Advice
                </h3>
                <p className="text-sm text-indigo-800 whitespace-pre-wrap leading-relaxed">{paceData.advice}</p>
              </div>

              <button
                onClick={analyzePace}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium transition"
              >
                <RefreshCw className="w-4 h-4" /> Re-analyze
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
          >
            <h2 className="font-semibold text-gray-900">Message History ({history.length})</h2>
            {historyOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {historyOpen && (
            <ul className="divide-y divide-slate-100">
              {history.map(msg => (
                <li key={msg.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full capitalize">
                      {msg.type.replace('_', ' ')}
                    </span>
                    {msg.donor && <span className="text-xs text-gray-500">· {msg.donor.full_name}</span>}
                    <span className="text-xs text-gray-400 ml-auto">{formatDate(msg.created_at.split('T')[0])}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{msg.generated_text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
