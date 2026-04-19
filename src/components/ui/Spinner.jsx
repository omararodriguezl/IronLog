import React from 'react'

export default function Spinner({ size = 32, color = 'var(--color-accent)' }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `3px solid var(--color-border)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export function FullPageSpinner() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      zIndex: 9999,
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Spinner size={48} />
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          IRON LOG
        </p>
      </div>
    </div>
  )
}
