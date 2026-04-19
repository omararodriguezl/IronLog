import React, { useState, useRef } from 'react'
import Button from '../ui/Button'
import { analyzeFood } from '../../lib/claude'
import Spinner from '../ui/Spinner'

export default function PhotoAnalyzer({ onConfirm, onClose }) {
  const [phase, setPhase] = useState('select') // select | analyzing | confirm | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    setPhase('analyzing')

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type || 'image/jpeg'

      try {
        const data = await analyzeFood(base64, mimeType)
        setResult(data)
        setPhase('confirm')
      } catch (err) {
        setError(err.message)
        setPhase('error')
      }
    }
    reader.readAsDataURL(file)
  }

  function handleConfirm() {
    if (!result) return
    onConfirm({
      meal_name: result.meal_name,
      calories: result.calories,
      protein_g: result.protein_g,
      carbs_g: result.carbs_g,
      fat_g: result.fat_g,
      entry_method: 'photo',
    })
  }

  if (phase === 'analyzing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
        <Spinner size={48} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Analizando con IA…
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', textAlign: 'center' }}>
          Identificando alimentos y calculando macros
        </p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</p>
        <p style={{ color: 'var(--color-danger)', marginBottom: '20px' }}>{error}</p>
        <Button onClick={() => setPhase('select')}>Intentar de nuevo</Button>
        <div style={{ marginTop: '8px' }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    )
  }

  if (phase === 'confirm' && result) {
    const confidenceColor = result.confidence === 'high' ? 'var(--color-accent)' : result.confidence === 'medium' ? 'var(--color-warning)' : 'var(--color-danger)'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          padding: '12px',
          background: `${confidenceColor}15`,
          border: `1px solid ${confidenceColor}`,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>🤖</span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Confianza: <span style={{ color: confidenceColor, fontWeight: '600' }}>{result.confidence}</span>
          </span>
        </div>

        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            {result.meal_name}
          </h3>
          {result.foods_identified?.length > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {result.foods_identified.join(', ')}
            </p>
          )}
          {result.note && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '6px', fontStyle: 'italic' }}>
              {result.note}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { label: 'Kcal', value: result.calories, color: 'var(--color-accent)', unit: '' },
            { label: 'Prot', value: result.protein_g, color: '#bc8cff', unit: 'g' },
            { label: 'Carbs', value: result.carbs_g, color: '#d29922', unit: 'g' },
            { label: 'Grasa', value: result.fat_g, color: '#ff7b72', unit: 'g' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 6px',
              textAlign: 'center',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: s.color }}>
                {s.value}{s.unit}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleConfirm}>Confirmar y guardar</Button>
        <Button variant="ghost" onClick={() => setPhase('select')}>Analizar otra foto</Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={e => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      <div
        onClick={() => { inputRef.current.removeAttribute('capture'); inputRef.current.click() }}
        style={{
          padding: '32px',
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          transition: 'border-color 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
      >
        <span style={{ fontSize: '48px' }}>📸</span>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            Seleccionar foto de la galería
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Claude analizará los alimentos y calculará los macros
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={() => { inputRef.current.setAttribute('capture', 'environment'); inputRef.current.click() }}
      >
        📷 Tomar foto ahora
      </Button>

      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
    </div>
  )
}
