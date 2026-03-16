import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function daysUntil(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getProgressPercent(current: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.min(100, Math.round((current / goal) * 100))
}

export function getDonorInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const GOAL_AMOUNT = 3600

export const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  check: 'Check',
  venmo: 'Venmo',
  paypal: 'PayPal',
  zelle: 'Zelle',
  online: 'Online',
  other: 'Other',
}

export const STATUS_LABELS: Record<string, string> = {
  pledged: 'Pledged',
  received: 'Received',
  processing: 'Processing',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS: Record<string, string> = {
  pledged: 'bg-yellow-100 text-yellow-800',
  received: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const MOTIVATIONAL_QUOTES = [
  "Every dollar brings you one step closer to changing lives. Keep going!",
  "Your faithfulness in fundraising reflects your heart for service.",
  "Great things happen when people come together for a purpose.",
  "The journey of a thousand miles begins with a single step — and a single dollar.",
  "You're not just raising money, you're building relationships that last a lifetime.",
  "God provides! Trust the process and keep asking.",
  "Your enthusiasm is contagious — let it inspire your donors too!",
  "This trip will change you as much as it changes those you serve.",
]
