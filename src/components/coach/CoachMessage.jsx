import React from 'react'
import Card from '../ui/Card'

export default function CoachMessage({ analysis, lastAnalyzed }) {
  if (!analysis) return null

  const timeAgo = lastAnalyzed
    ? formatTimeAgo(new Date(lastAnalyzed))
    : null

  return (
    <Card style={{ borderLeft: '3px solid var(--color-accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>🧠</span>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
          }}>
            Coach IA
          </h3>
          {timeAgo && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
              {timeAgo}
            </p>
          )}
        </div>
      </div>

      <div style={{
        fontSize: '14px',
        lineHeight: '1.7',
        color: 'var(--color-text)',
        whiteSpace: 'pre-wrap',
        fontFamily: 'var(--font-body)',
      }}>
        {analysis}
      </div>
    </Card>
  )
}

function formatTimeAgo(date) {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Justo ahora'
  if (mins < 60) return `Hace ${mins} minutos`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} horas`
  const days = Math.floor(hours / 24)
  return `Hace ${days} días`
}
