export type DonationMethod = 'cash' | 'check' | 'venmo' | 'paypal' | 'zelle' | 'online' | 'other'
export type DonationStatus = 'pledged' | 'received' | 'processing' | 'cancelled'
export type MilestoneType = 'deadline' | 'goal' | 'event' | 'reminder'
export type AIMessageType = 'solicitation' | 'thank_you' | 'newsletter' | 'pace_report'

export interface Profile {
  id: string
  full_name: string | null
  trip_name: string
  goal_amount: number
  departure_date: string | null
  created_at: string
  updated_at: string
}

export interface Donor {
  id: string
  user_id: string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // From donor_totals view (optional, when joined)
  total_received?: number
  total_pledged?: number
  donation_count?: number
}

export interface Donation {
  id: string
  user_id: string
  donor_id: string | null
  donor_name_override: string | null
  amount: number
  method: DonationMethod
  status: DonationStatus
  received_at: string
  notes: string | null
  is_anonymous: boolean
  created_at: string
  updated_at: string
  // Joined
  donor?: Donor | null
}

export interface GiftTier {
  id: string
  user_id: string
  name: string
  min_amount: number
  max_amount: number | null
  description: string | null
  color: string
  sort_order: number
  created_at: string
}

export interface SupporterGift {
  id: string
  user_id: string
  donor_id: string
  gift_tier_id: string | null
  custom_gift: string | null
  is_eligible: boolean
  is_fulfilled: boolean
  fulfilled_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  donor?: Donor
  gift_tier?: GiftTier
}

export interface Milestone {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string
  type: MilestoneType
  target_amount: number | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  user_id: string
  donor_id: string | null
  type: AIMessageType
  prompt_context: Record<string, unknown> | null
  generated_text: string
  created_at: string
  donor?: Donor
}

export interface FundraisingSummary {
  user_id: string
  total_received: number
  total_pledged: number
  total_committed: number
  donation_count: number
  unique_donor_count: number
  last_donation_date: string | null
  first_donation_date: string | null
}
