import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { suggestExerciseAlternatives } from '../../lib/claude'
import Icon from '../ui/Icon'

export default function ExerciseSwapSheet({ exercise, profile, onSwap, onClose }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [manualName, setManualName] = useState('')
  const [showManual, setShowManual] = useState(false)

  useEffect(() => {
    if (!exercise) return
    setLoading(true)
    setError(null)
    suggestExerciseAlternatives(exercise, profile)
      .then(setSuggestions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [exercise?.id])

  if (!exercise) return null

  function handleSelect(alt) {
    onSwap({ ...alt, id: exercise.id })
    onClose()
  }

  function handleManualSave() {
    if (!manualName.trim()) return
    onSwap({
      name: manualName.trim(),
      english_name: manualName.trim(),
      muscle_group: exercise.muscle_group,
      sets: exercise.sets,
      reps: exercise.reps,
      rest_seconds: exercise.rest_seconds,
      tip: exercise.tip,
    })
    onClose()
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-1)',
        borderRadius: '20px 20px 0 0',
        width: '100%',
        maxWidth: 600,
        maxHeight: '85dvh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.25s ease',
        paddingBottom: 'var(--safe-bottom)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line-strong)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <div>
            <div className="eyebrow">Cambiar ejercicio</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{exercise.name}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="x" size={15} color="var(--ink-3)" />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px 20px' }}>

          {/* AI suggestions */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            <Icon name="sparkle" size={11} color="var(--acc)" style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            Sugerencias IA
          </div>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 72, borderRadius: 12, background: 'var(--bg-2)', animation: 'pulse 1.4s ease infinite' }} />
              ))}
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(224,84,84,0.08)', border: '1px solid rgba(224,84,84,0.2)', fontSize: 13, color: '#e05454', marginBottom: 12 }}>
              Error al obtener sugerencias: {error}
            </div>
          )}

          {!loading && suggestions.map((alt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(alt)}
              style={{
                width: '100%', marginBottom: 8, padding: '12px 14px',
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{alt.name}</div>
                <div className="eyebrow" style={{ marginTop: 3 }}>{alt.muscle_group} · {alt.sets}×{alt.reps}</div>
                {alt.tip && <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginTop: 3 }}>{alt.tip}</div>}
              </div>
              <Icon name="chevronR" size={16} color="var(--ink-4)" style={{ flexShrink: 0, marginLeft: 8 }} />
            </button>
          ))}

          {/* Manual entry */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <button
              onClick={() => setShowManual(m => !m)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: showManual ? 12 : 0 }}
            >
              <Icon name={showManual ? 'chevronU' : 'chevronD'} size={15} color="var(--ink-3)" />
              <span className="eyebrow">Ingresar manualmente</span>
            </button>

            {showManual && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualSave()}
                  placeholder="Nombre del ejercicio"
                  style={{
                    flex: 1, height: 44, padding: '0 14px', borderRadius: 10,
                    background: 'var(--bg-2)', border: '1px solid var(--line-strong)',
                    color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleManualSave}
                  disabled={!manualName.trim()}
                  style={{
                    height: 44, padding: '0 18px', borderRadius: 10,
                    background: manualName.trim() ? 'var(--acc)' : 'var(--bg-3)',
                    color: manualName.trim() ? 'var(--acc-ink)' : 'var(--ink-4)',
                    border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                    cursor: manualName.trim() ? 'pointer' : 'default',
                  }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
