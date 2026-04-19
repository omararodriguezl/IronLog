import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { cardioColors, cardioLabels } from '../../theme'

export default function CardioDay({ session, date, onToggleComplete, onEdit, onDelete }) {
  if (!session) {
    return (
      <Card style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '14px' }}>
          Sin entrenamiento programado para este día
        </p>
      </Card>
    )
  }

  const color = cardioColors[session.session_type] || 'var(--color-text-muted)'

  return (
    <Card style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color,
              padding: '2px 8px',
              background: `${color}22`,
              borderRadius: 'var(--radius-full)',
            }}>
              {cardioLabels[session.session_type] || session.session_type}
            </span>
            {session.completed && (
              <span style={{ color: 'var(--color-accent)', fontSize: '14px' }}>✓</span>
            )}
          </div>

          {session.description && (
            <p style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '4px', lineHeight: '1.5' }}>
              {session.description}
            </p>
          )}

          {session.distance_miles && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              📏 {session.distance_miles} millas
            </p>
          )}

          <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
            {new Date(date + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          onClick={() => onToggleComplete(session.id, !session.completed)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${session.completed ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: session.completed ? 'var(--color-accent-dim)' : 'var(--color-surface-hover)',
            color: session.completed ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {session.completed ? '✓ COMPLETADO' : 'MARCAR COMPLETADO'}
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(session)}
            style={{
              width: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-muted)',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(session.id)}
            style={{
              width: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            🗑️
          </button>
        )}
      </div>
    </Card>
  )
}
