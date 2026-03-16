'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Milestone, MilestoneType } from '@/types'
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils'
import { Plus, Check, Trash2, Clock, AlertTriangle, Target, Calendar, Bell } from 'lucide-react'

const TYPE_ICONS: Record<MilestoneType, React.ElementType> = {
  deadline: Clock,
  goal: Target,
  event: Calendar,
  reminder: Bell,
}

const TYPE_LABELS: Record<MilestoneType, string> = {
  deadline: 'Deadline',
  goal: 'Goal',
  event: 'Event',
  reminder: 'Reminder',
}

export default function MilestonesPage() {
  const supabase = createClient()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [type, setType] = useState<MilestoneType>('deadline')
  const [targetAmount, setTargetAmount] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchMilestones = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('milestones').select('*').order('due_date', { ascending: true })
    setMilestones(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchMilestones() }, [fetchMilestones])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setFormError('Not authenticated'); setFormLoading(false); return }

    const { error } = await supabase.from('milestones').insert({
      user_id: user.id,
      title,
      description: description || null,
      due_date: dueDate,
      type,
      target_amount: targetAmount ? parseFloat(targetAmount) : null,
    })
    if (error) setFormError(error.message)
    else {
      setShowForm(false); setTitle(''); setDescription(''); setDueDate(''); setType('deadline'); setTargetAmount('')
      fetchMilestones()
    }
    setFormLoading(false)
  }

  async function toggleComplete(m: Milestone) {
    await supabase.from('milestones').update({
      is_completed: !m.is_completed,
      completed_at: !m.is_completed ? new Date().toISOString() : null,
    }).eq('id', m.id)
    fetchMilestones()
  }

  async function handleDelete(id: string) {
    await supabase.from('milestones').delete().eq('id', id)
    fetchMilestones()
  }

  const upcoming = milestones.filter(m => !m.is_completed)
  const completed = milestones.filter(m => m.is_completed)
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"

  function MilestoneCard({ m }: { m: Milestone }) {
    const Icon = TYPE_ICONS[m.type]
    const days = daysUntil(m.due_date)
    const overdue = days < 0 && !m.is_completed
    const urgent = days <= 3 && days >= 0 && !m.is_completed
    const warning = days <= 7 && days > 3 && !m.is_completed

    return (
      <div className={`bg-white rounded-2xl border shadow-sm p-5 transition ${overdue ? 'border-red-200' : m.is_completed ? 'border-green-200 opacity-75' : 'border-slate-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.is_completed ? 'bg-green-100 text-green-600' : overdue ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {m.is_completed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold text-gray-900 ${m.is_completed ? 'line-through text-gray-400' : ''}`}>{m.title}</h3>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{TYPE_LABELS[m.type]}</span>
              </div>
              {m.description && <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(m.due_date)}
                </span>
                {m.target_amount && (
                  <span className="text-xs text-indigo-600 font-medium">
                    Target: {formatCurrency(m.target_amount)}
                  </span>
                )}
                {!m.is_completed && (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${overdue ? 'text-red-600' : urgent ? 'text-orange-600' : warning ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {overdue ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {overdue ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue` : days === 0 ? 'Due today' : `${days} day${days !== 1 ? 's' : ''} left`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleComplete(m)}
              className={`p-1.5 rounded-lg transition ${m.is_completed ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
              title={m.is_completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
          <p className="text-gray-500 text-sm mt-0.5">{upcoming.length} upcoming · {completed.length} completed</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">Add Milestone</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. 50% Fundraising Goal" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input required type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value as MilestoneType)} className={inputClass}>
                    <option value="deadline">Deadline</option>
                    <option value="goal">Goal</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (optional)</label>
                <div className="relative"><span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                  <input type="number" min="0" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className={`${inputClass} pl-7`} placeholder="0.00" /></div></div>
              {formError && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold">{formLoading ? 'Saving...' : 'Add Milestone'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <>
          {upcoming.length === 0 && completed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-gray-500">No milestones yet. Set a fundraising deadline!</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Upcoming</h2>
                  {upcoming.map(m => <MilestoneCard key={m.id} m={m} />)}
                </div>
              )}
              {completed.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Completed</h2>
                  {completed.map(m => <MilestoneCard key={m.id} m={m} />)}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
