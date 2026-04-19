import React from 'react'

export default function Input({
  label,
  error,
  hint,
  style,
  containerStyle,
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...containerStyle }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          minHeight: '48px',
          padding: '12px 14px',
          background: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.15s ease',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-accent)' }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)' }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>
      )}
      {hint && !error && (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{hint}</span>
      )}
    </div>
  )
}

export function Textarea({ label, error, hint, style, containerStyle, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...containerStyle }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          padding: '12px 14px',
          background: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          outline: 'none',
          width: '100%',
          resize: 'vertical',
          minHeight: '100px',
          transition: 'border-color 0.15s ease',
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--color-accent)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{hint}</span>}
    </div>
  )
}
