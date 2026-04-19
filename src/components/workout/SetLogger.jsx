import React, { useState } from 'react'
import Button from '../ui/Button'

export default function SetLogger({ setNumber, prescribedReps, onLog, useKg = true }) {
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  function handleLog() {
    if (!weight || !reps) return
    onLog({
      weight: parseFloat(weight),
      reps: parseInt(reps),
      unit: useKg ? 'kg' : 'lbs',
    })
    setWeight('')
    setReps('')
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr auto',
      gap: '8px',
      alignItems: 'end',
    }}>
      <div>
        <label style={labelStyle}>Peso ({useKg ? 'kg' : 'lbs'})</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Reps {prescribedReps && <span style={{ color: 'var(--color-text-dim)' }}>({prescribedReps})</span>}</label>
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={reps}
          onChange={e => setReps(e.target.value)}
          style={inputStyle}
        />
      </div>
      <button
        onClick={handleLog}
        disabled={!weight || !reps}
        style={{
          minHeight: '48px',
          padding: '0 16px',
          background: weight && reps ? 'var(--color-accent)' : 'var(--color-surface-hover)',
          color: weight && reps ? '#0d1117' : 'var(--color-text-dim)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.05em',
          cursor: weight && reps ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        LOG
      </button>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  minHeight: '48px',
  padding: '12px 10px',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  outline: 'none',
  textAlign: 'center',
}
