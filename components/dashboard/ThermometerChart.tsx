'use client'

import { getProgressPercent, formatCurrency } from '@/lib/utils'

interface ThermometerChartProps {
  current: number
  goal: number
}

export default function ThermometerChart({ current, goal }: ThermometerChartProps) {
  const percent = getProgressPercent(current, goal)
  const fillHeight = Math.max(4, percent) // min 4% so the fill is visible

  const fillColor =
    percent >= 100
      ? '#22c55e'
      : percent >= 75
      ? '#84cc16'
      : percent >= 50
      ? '#f59e0b'
      : percent >= 25
      ? '#f97316'
      : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 64, height: 280 }}>
        {/* Tube */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 40,
            width: 32,
            height: 220,
            backgroundColor: '#e2e8f0',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${fillHeight}%`,
              backgroundColor: fillColor,
              transition: 'height 1s ease-in-out, background-color 0.5s',
              borderRadius: '0',
            }}
          />
          {/* Tick marks */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              style={{
                position: 'absolute',
                bottom: `${tick}%`,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: 'rgba(148,163,184,0.5)',
              }}
            />
          ))}
        </div>

        {/* Bulb */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 0,
            width: 48,
            height: 48,
            backgroundColor: fillColor,
            borderRadius: '50%',
            transition: 'background-color 0.5s',
            border: '4px solid white',
            boxShadow: '0 0 0 2px #e2e8f0',
          }}
        />

        {/* Percent label */}
        <div
          className="absolute -right-10 text-xs font-bold"
          style={{
            bottom: `calc(40px + ${fillHeight}% * 2.2px)`,
            color: fillColor,
            minWidth: 40,
            textAlign: 'left',
          }}
        >
          {percent}%
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(current)}</p>
        <p className="text-sm text-gray-400">of {formatCurrency(goal)} goal</p>
      </div>
    </div>
  )
}
