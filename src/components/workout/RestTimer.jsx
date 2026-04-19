import React, { useState, useEffect, useRef } from 'react'

export default function RestTimer({ seconds = 90, onComplete, autoStart = false }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(autoStart)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const pct = ((seconds - remaining) / seconds) * 100
  const radius = 36
  const circumference = 2 * Math.PI * radius

  function reset() {
    setRemaining(seconds)
    setRunning(false)
  }

  function toggle() {
    if (remaining === 0) {
      setRemaining(seconds)
      setRunning(true)
    } else {
      setRunning(r => !r)
    }
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
    }}>
      <div style={{ position: 'relative', width: 90, height: 90 }} onClick={toggle}>
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)', cursor: 'pointer' }}>
          <circle cx="45" cy="45" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="5" />
          <circle
            cx="45" cy="45" r={radius}
            fill="none"
            stroke={remaining === 0 ? 'var(--color-danger)' : 'var(--color-accent)'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            fontWeight: '700',
            color: remaining === 0 ? 'var(--color-danger)' : 'var(--color-text)',
          }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--color-text-dim)' }}>
            {running ? 'PAUSAR' : remaining === 0 ? 'FIN' : 'INICIAR'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={toggle}
          style={{
            padding: '8px 20px',
            background: running ? 'var(--color-surface-hover)' : 'var(--color-accent)',
            color: running ? 'var(--color-text)' : '#0d1117',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          {running ? 'PAUSAR' : remaining === 0 ? 'REINICIAR' : 'INICIAR'}
        </button>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ↺
        </button>
      </div>
    </div>
  )
}
