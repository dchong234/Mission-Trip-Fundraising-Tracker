'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Donor } from '@/types'
import { formatCurrency, getDonorInitials } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, Mail, Phone } from 'lucide-react'

interface DonorWithTotals extends Donor {
  total_received: number
  total_pledged: number
  donation_count: number
}

function DonorForm({
  initial,
  onSuccess,
  onCancel,
}: {
  initial?: Donor
  onSuccess: () => void
  onCancel: () => void
}) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(initial?.full_name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
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
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    }

    const { error: err } = initial
      ? await supabase.from('donors').update(payload).eq('id', initial.id)
      : await supabase.from('donors').insert(payload)

    if (err) setError(err.message)
    else onSuccess()
    setLoading(false)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input required value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="John Smith" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="john@email.com" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="(555) 000-0000" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <input value={address} onChange={e => setAddress(e.target.value)} className={inputClass} placeholder="123 Main St, City, State" />
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={inputClass} placeholder="Any notes about this donor..." />
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold">
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Donor'}
        </button>
      </div>
    </form>
  )
}

export default function DonorsPage() {
  const supabase = createClient()
  const [donors, setDonors] = useState<DonorWithTotals[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editDonor, setEditDonor] = useState<Donor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('donor_totals').select('*').order('full_name')
    setDonors((data ?? []) as DonorWithTotals[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchDonors() }, [fetchDonors])

  async function handleDelete(id: string) {
    await supabase.from('donors').delete().eq('id', id)
    setDeleteId(null)
    fetchDonors()
  }

  const filtered = donors.filter(d =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
          <p className="text-gray-500 text-sm mt-0.5">{donors.length} supporters total</p>
        </div>
        <button
          onClick={() => { setEditDonor(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add Donor
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search donors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Modal */}
      {(showForm || editDonor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editDonor ? 'Edit Donor' : 'Add Donor'}</h2>
            <DonorForm
              initial={editDonor ?? undefined}
              onSuccess={() => { setShowForm(false); setEditDonor(null); fetchDonors() }}
              onCancel={() => { setShowForm(false); setEditDonor(null) }}
            />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-2">Delete Donor?</h2>
            <p className="text-gray-500 text-sm mb-6">Their donations will remain but be unlinked.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500">No donors yet. Add your first supporter!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(donor => (
            <div key={donor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {getDonorInitials(donor.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{donor.full_name}</p>
                    <p className="text-xs text-gray-400">{donor.donation_count} donation{donor.donation_count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditDonor(donor); setShowForm(false) }} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(donor.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(donor.total_received)}</div>
              {donor.total_pledged > 0 && (
                <p className="text-xs text-yellow-600 mb-2">+{formatCurrency(donor.total_pledged)} pledged</p>
              )}

              {(donor.email || donor.phone) && (
                <div className="space-y-1 mt-3 pt-3 border-t border-slate-100">
                  {donor.email && (
                    <a href={`mailto:${donor.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition">
                      <Mail className="w-3.5 h-3.5" /> {donor.email}
                    </a>
                  )}
                  {donor.phone && (
                    <a href={`tel:${donor.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-indigo-600 transition">
                      <Phone className="w-3.5 h-3.5" /> {donor.phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
