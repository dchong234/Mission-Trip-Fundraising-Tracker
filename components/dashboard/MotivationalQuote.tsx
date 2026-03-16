'use client'

import { useEffect, useState } from 'react'
import { MOTIVATIONAL_QUOTES } from '@/lib/utils'

export default function MotivationalQuote() {
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0])

  useEffect(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    setQuote(MOTIVATIONAL_QUOTES[idx])
  }, [])

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
      <p className="text-lg font-medium leading-relaxed">"{quote}"</p>
      <p className="text-indigo-200 text-sm mt-2">Daily encouragement ✨</p>
    </div>
  )
}
