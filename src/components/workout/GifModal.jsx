import React from 'react'
import Modal from '../ui/Modal'

export default function GifModal({ exercise, onClose }) {
  const englishName = exercise?.english_name || exercise?.name || ''
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(englishName + ' exercise form tutorial')}`

  return (
    <Modal isOpen={!!exercise} onClose={onClose} title={exercise?.name}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '16px',
            background: '#ff000022',
            border: '1px solid #ff000044',
            borderRadius: 'var(--radius-lg)',
            color: '#ff4444',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.06em',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '22px' }}>▶</span>
          VER TUTORIAL EN YOUTUBE
        </a>

        {exercise?.tip && (
          <div style={{
            padding: '12px 14px',
            background: 'var(--color-accent-dim)',
            borderRadius: 'var(--radius-md)',
            borderLeft: '3px solid var(--color-accent)',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '4px',
            }}>
              TÉCNICA
            </p>
            <p style={{ color: 'var(--color-text)', fontSize: '14px', lineHeight: '1.5' }}>
              {exercise.tip}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <Stat label="Series" value={exercise?.sets} />
          <Stat label="Reps" value={exercise?.reps} />
          <Stat label="Descanso" value={exercise?.rest_seconds ? `${exercise.rest_seconds}s` : '—'} />
        </div>
      </div>
    </Modal>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{
      background: 'var(--color-surface-hover)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 8px',
      textAlign: 'center',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
        {value || '—'}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}
