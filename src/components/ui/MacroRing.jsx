import React from 'react'

export default function MacroRing({ label, current, goal, color, unit = 'g' }) {
  const pct = Math.min((current / goal) * 100, 100)
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference - (pct / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="6"
          />
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--color-text)',
            lineHeight: 1,
          }}>
            {Math.round(current)}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            {unit}
          </span>
        </div>
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
      }}>
        {label}
      </span>
      <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-body)' }}>
        / {goal}{unit}
      </span>
    </div>
  )
}
