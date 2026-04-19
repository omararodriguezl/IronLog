import React, { useState } from 'react'
import { cardioColors, cardioLabels } from '../../theme'

const DAYS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function CardioCalendar({ sessions, onDayClick, selectedWeek }) {
  const today = new Date()

  function getWeekDates(offset = 0) {
    const start = new Date(today)
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
    start.setDate(today.getDate() - dayOfWeek + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const weekDates = getWeekDates(selectedWeek || 0)
  const weekLabel = weekDates[0].toLocaleDateString('es', { month: 'long', year: 'numeric' })

  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        textTransform: 'capitalize',
        marginBottom: '12px',
        textAlign: 'center',
        letterSpacing: '0.06em',
      }}>
        {weekLabel}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {DAYS_ES.map((d, i) => {
          const date = weekDates[i]
          const dateStr = date.toISOString().split('T')[0]
          const isToday = dateStr === today.toISOString().split('T')[0]
          const session = sessions.find(s => s.date === dateStr)
          const color = session ? cardioColors[session.session_type] : null

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.04em',
              }}>
                {d}
              </span>
              <div
                onClick={() => onDayClick?.(dateStr, session)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  background: session
                    ? `${color}22`
                    : isToday
                    ? 'var(--color-surface-hover)'
                    : 'var(--color-surface)',
                  border: `1px solid ${isToday ? 'var(--color-accent)' : session ? color : 'var(--color-border)'}`,
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: isToday ? '700' : '400',
                  color: isToday ? 'var(--color-accent)' : 'var(--color-text)',
                }}>
                  {date.getDate()}
                </span>
                {session && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: color,
                    ...(session.completed ? { boxShadow: `0 0 4px ${color}` } : { opacity: 0.7 }),
                  }} />
                )}
              </div>
              {session && (
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-display)',
                  color: color,
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {session.distance_miles ? `${session.distance_miles}mi` : cardioLabels[session.session_type]?.split(' ')[0]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
        {Object.entries(cardioColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              {cardioLabels[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
