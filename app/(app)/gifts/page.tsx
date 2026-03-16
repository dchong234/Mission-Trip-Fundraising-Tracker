'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Donor, GiftTier, SupporterGift } from '@/types'
import { formatCurrency, getDonorInitials } from '@/lib/utils'
import { Plus, Gift, Check, Pencil, Trash2 } from 'lucide-react'

export default function GiftsPage() {
  const supabase = createClient()
  const [tiers, setTiers] = useState<GiftTier[]>([])
  const [gifts, setGifts] = useState<(SupporterGift & { donor: Donor; gift_tier: GiftTier })[]>([])
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [showTierForm, setShowTierForm] = useState(false)
  const [showGiftForm, setShowGiftForm] = useState(false)
  const [editTier, setEditTier] = useState<GiftTier | null>(null)

  // Tier form state
  const [tierName, setTierName] = useState('')
  const [tierMin, setTierMin] = useState('')
  const [tierMax, setTierMax] = useState('')
  const [tierDesc, setTierDesc] = useState('')
  const [tierColor, setTierColor] = useState('#6366f1')
  const [tierLoading, setTierLoading] = useState(false)

  // Gift form state
  const [giftDonorId, setGiftDonorId] = useState('')
  const [giftTierId, setGiftTierId] = useState('')
  const [giftCustom, setGiftCustom] = useState('')
  const [giftNotes, setGiftNotes] = useState('')
  const [giftLoading, setGiftLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [tiersRes, giftsRes, donorsRes] = await Promise.all([
      supabase.from('gift_tiers').select('*').order('sort_order'),
      supabase.from('supporter_gifts').select('*, donor:donors(*), gift_tier:gift_tiers(*)').order('created_at', { ascending: false }),
      supabase.from('donors').select('*').order('full_name'),
    ])
    setTiers(tiersRes.data ?? [])
    setGifts((giftsRes.data ?? []) as (SupporterGift & { donor: Donor; gift_tier: GiftTier })[])
    setDonors(donorsRes.data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleSaveTier(e: React.FormEvent) {
    e.preventDefault()
    setTierLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id,
      name: tierName,
      min_amount: parseFloat(tierMin),
      max_amount: tierMax ? parseFloat(tierMax) : null,
      description: tierDesc || null,
      color: tierColor,
      sort_order: tiers.length,
    }
    if (editTier) {
      await supabase.from('gift_tiers').update(payload).eq('id', editTier.id)
    } else {
      await supabase.from('gift_tiers').insert(payload)
    }
    setShowTierForm(false); setEditTier(null)
    setTierName(''); setTierMin(''); setTierMax(''); setTierDesc(''); setTierColor('#6366f1')
    setTierLoading(false)
    fetchAll()
  }

  async function handleSaveGift(e: React.FormEvent) {
    e.preventDefault()
    setGiftLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('supporter_gifts').insert({
      user_id: user.id,
      donor_id: giftDonorId,
      gift_tier_id: giftTierId || null,
      custom_gift: giftCustom || null,
      notes: giftNotes || null,
    })
    setShowGiftForm(false); setGiftDonorId(''); setGiftTierId(''); setGiftCustom(''); setGiftNotes('')
    setGiftLoading(false)
    fetchAll()
  }

  async function toggleFulfilled(gift: SupporterGift & { donor: Donor; gift_tier: GiftTier }) {
    await supabase.from('supporter_gifts').update({
      is_fulfilled: !gift.is_fulfilled,
      fulfilled_at: !gift.is_fulfilled ? new Date().toISOString() : null,
    }).eq('id', gift.id)
    fetchAll()
  }

  async function deleteGift(id: string) {
    await supabase.from('supporter_gifts').delete().eq('id', id)
    fetchAll()
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supporter Gifts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track gifts for donors who have supported you</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditTier(null); setShowTierForm(true) }} className="flex items-center gap-1.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl text-sm font-semibold transition">
            <Plus className="w-4 h-4" /> Tier
          </button>
          <button onClick={() => setShowGiftForm(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition">
            <Gift className="w-4 h-4" /> Add Gift
          </button>
        </div>
      </div>

      {/* Gift Tiers */}
      {tiers.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">Gift Tiers</h2>
          <div className="flex flex-wrap gap-3">
            {tiers.map(tier => (
              <div key={tier.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="font-semibold text-sm text-gray-900">{tier.name}</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(tier.min_amount)}{tier.max_amount ? `–${formatCurrency(tier.max_amount)}` : '+'}
                </span>
                {tier.description && <span className="text-xs text-gray-400">· {tier.description}</span>}
                <button onClick={() => { setEditTier(tier); setTierName(tier.name); setTierMin(tier.min_amount.toString()); setTierMax(tier.max_amount?.toString() ?? ''); setTierDesc(tier.description ?? ''); setTierColor(tier.color); setShowTierForm(true) }} className="ml-1 p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier Form Modal */}
      {showTierForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editTier ? 'Edit Tier' : 'Add Gift Tier'}</h2>
            <form onSubmit={handleSaveTier} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Tier Name *</label>
                <input required value={tierName} onChange={e => setTierName(e.target.value)} className={inputClass} placeholder="e.g. Gold, Silver, Bronze" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Amount *</label>
                  <input type="number" required min="0" value={tierMin} onChange={e => setTierMin(e.target.value)} className={inputClass} placeholder="100" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input type="number" min="0" value={tierMax} onChange={e => setTierMax(e.target.value)} className={inputClass} placeholder="No limit" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={tierDesc} onChange={e => setTierDesc(e.target.value)} className={inputClass} placeholder="What gift do they receive?" /></div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Color:</label>
                <input type="color" value={tierColor} onChange={e => setTierColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowTierForm(false); setEditTier(null) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={tierLoading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold">{tierLoading ? 'Saving...' : 'Save Tier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Form Modal */}
      {showGiftForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Add Supporter Gift</h2>
            <form onSubmit={handleSaveGift} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donor *</label>
                <select required value={giftDonorId} onChange={e => setGiftDonorId(e.target.value)} className={inputClass}>
                  <option value="">Select donor...</option>
                  {donors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gift Tier</label>
                <select value={giftTierId} onChange={e => setGiftTierId(e.target.value)} className={inputClass}>
                  <option value="">No tier (custom)</option>
                  {tiers.map(t => <option key={t.id} value={t.id}>{t.name} ({formatCurrency(t.min_amount)}{t.max_amount ? `–${formatCurrency(t.max_amount)}` : '+'})</option>)}
                </select>
              </div>
              {!giftTierId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Gift</label>
                  <input value={giftCustom} onChange={e => setGiftCustom(e.target.value)} className={inputClass} placeholder="What are you giving them?" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={giftNotes} onChange={e => setGiftNotes(e.target.value)} rows={2} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowGiftForm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={giftLoading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold">{giftLoading ? 'Saving...' : 'Add Gift'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Tracking Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : gifts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🎁</p>
          <p className="text-gray-500">No gifts tracked yet. Add your first supporter gift!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-gray-900">Gift Tracking</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {gifts.filter(g => g.is_fulfilled).length} of {gifts.length} fulfilled
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {gifts.map(gift => (
              <li key={gift.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {getDonorInitials(gift.donor.full_name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{gift.donor.full_name}</p>
                    <div className="flex items-center gap-2">
                      {gift.gift_tier && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: gift.gift_tier.color + '20', color: gift.gift_tier.color }}>
                          {gift.gift_tier.name}
                        </span>
                      )}
                      {gift.custom_gift && <span className="text-xs text-gray-500">{gift.custom_gift}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFulfilled(gift)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${gift.is_fulfilled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {gift.is_fulfilled ? 'Fulfilled' : 'Mark Done'}
                  </button>
                  <button onClick={() => deleteGift(gift.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
