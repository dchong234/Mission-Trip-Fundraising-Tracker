'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Donor, DonationMethod, DonationStatus } from '@/types'
import { X } from 'lucide-react'

interface DonationFormProps {
  donors: Donor[]
  onSuccess: () => void
  onCancel: () => void
  initialData?: {
    id: string
    donor_id: string | null
    donor_name_override: string | null
    amount: number
    method: DonationMethod
    status: DonationStatus
    received_at: string
    notes: string | null
    is_anonymous: boolean
  }
}

const METHODS: { value: DonationMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'online', label: 'Online' },
  { value: 'other', label: 'Other' },
]

const STATUSES: { value: DonationStatus; label: string }[] = [
  { value: 'received', label: 'Received' },
  { value: 'pledged', label: 'Pledged' },
  { value: 'processing', label: 'Processing' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function DonationForm({ donors, onSuccess, onCancel, initialData }: DonationFormProps) {
  const supabase = createClient()
  const isEdit = !!initialData

  const [donorId, setDonorId] = useState(initialData?.donor_id ?? '')
  const [donorNameOverride, setDonorNameOverride] = useState(initialData?.donor_name_override ?? '')
  const [amount, setAmount] = useState(initialData?.amount?.toString() ?? '')
  const [method, setMethod] = useState<DonationMethod>(initialData?.method ?? 'cash')
  const [status, setStatus] = useState<DonationStatus>(initialData?.status ?? 'received')
  const [receivedAt, setReceivedAt] = useState(
    initialData?.received_at ?? new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const payload = {
      user_id: user.id,
      donor_id: donorId || null,
      donor_name_override: donorId ? null : (donorNameOverride || null),
      amount: parseFloat(amount),
      method,
      status,
      received_at: receivedAt,
      notes: notes || null,
      is_anonymous: isAnonymous,
    }

    let err
    if (isEdit) {
      const res = await supabase.from('donations').update(payload).eq('id', initialData!.id)
      err = res.error
    } else {
      const res = await supabase.from('donations').insert(payload)
      err = res.error
    }

    if (err) {
      setError(err.message)
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Anonymous toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 rounded text-indigo-600"
        />
        <span className="text-sm text-gray-700">Anonymous donation</span>
      </label>

      {!isAnonymous && (
        <div>
          <label className={labelClass}>Donor</label>
          <select
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            className={inputClass}
          >
            <option value="">— New / unlisted donor —</option>
            {donors.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
          {!donorId && (
            <input
              className={`${inputClass} mt-2`}
              placeholder="Donor name (optional)"
              value={donorNameOverride}
              onChange={(e) => setDonorNameOverride(e.target.value)}
            />
          )}
        </div>
      )}

      {/* Amount */}
      <div>
        <label className={labelClass}>Amount *</label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputClass} pl-7`}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Method */}
        <div>
          <label className={labelClass}>Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as DonationMethod)} className={inputClass}>
            {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as DonationStatus)} className={inputClass}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Date Received</label>
        <input
          type="date"
          value={receivedAt}
          onChange={(e) => setReceivedAt(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Any notes about this donation..."
        />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold transition"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Donation'}
        </button>
      </div>
    </form>
  )
}
