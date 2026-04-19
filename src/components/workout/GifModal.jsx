import React, { useState } from 'react'
import Modal from '../ui/Modal'

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function GifModal({ exercise, onClose }) {
  const [imgError, setImgError] = useState(false)
  const slug = slugify(exercise?.name || '')
  const gifUrl = `https://fitnessprogramer.com/wp-content/uploads/2021/02/${slug}.gif`

  return (
    <Modal isOpen={!!exercise} onClose={onClose} title={exercise?.name}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {!imgError ? (
          <img
            src={gifUrl}
            alt={exercise?.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '320px',
            height: '200px',
            background: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--color-text-muted)',
          }}>
            <span style={{ fontSize: '40px' }}>🏋️</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px' }}>
              GIF no disponible
            </span>
          </div>
        )}

        {exercise?.tip && (
          <div style={{
            width: '100%',
            padding: '12px 14px',
            background: 'var(--color-accent-dim)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-accent)',
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', width: '100%' }}>
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
