import React, { useState } from 'react'
import Modal from '../ui/Modal'

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// fitnessprogramer.com stores GIFs across multiple upload dates
const GIF_DATE_PATHS = [
  '2021/02', '2021/04', '2021/06', '2022/02', '2022/04',
  '2022/06', '2021/08', '2021/10', '2023/02', '2021/12',
]

export default function GifModal({ exercise, onClose }) {
  const [dateIdx, setDateIdx] = useState(0)
  const [allFailed, setAllFailed] = useState(false)

  const rawName = exercise?.english_name || exercise?.name || ''
  const slug = slugify(rawName)
  const gifUrl = `https://fitnessprogramer.com/wp-content/uploads/${GIF_DATE_PATHS[dateIdx]}/${slug}.gif`

  function handleImgError() {
    if (dateIdx < GIF_DATE_PATHS.length - 1) {
      setDateIdx(i => i + 1)
    } else {
      setAllFailed(true)
    }
  }

  // Reset state when exercise changes
  React.useEffect(() => {
    setDateIdx(0)
    setAllFailed(false)
  }, [exercise?.id])

  return (
    <Modal isOpen={!!exercise} onClose={onClose} title={exercise?.name}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {!allFailed ? (
          <img
            key={`${exercise?.id}-${dateIdx}`}
            src={gifUrl}
            alt={exercise?.name}
            onError={handleImgError}
            style={{
              width: '100%',
              maxWidth: '320px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              minHeight: '180px',
              objectFit: 'cover',
              background: 'var(--color-surface-hover)',
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
            gap: '10px',
          }}>
            <span style={{ fontSize: '40px' }}>🏋️</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              GIF no disponible
            </span>
            {exercise?.english_name && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                {exercise.english_name}
              </span>
            )}
          </div>
        )}

        {exercise?.tip && (
          <div style={{
            width: '100%',
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
