import React from 'react'

export default function Card({ children, style, onClick, hoverable, ...props }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        transition: 'background 0.15s ease',
        cursor: onClick ? 'pointer' : undefined,
        ...(hoverable || onClick ? { cursor: 'pointer' } : {}),
        ...style,
      }}
      onMouseEnter={e => { if (hoverable || onClick) e.currentTarget.style.background = 'var(--color-surface-hover)' }}
      onMouseLeave={e => { if (hoverable || onClick) e.currentTarget.style.background = 'var(--color-surface)' }}
      {...props}
    >
      {children}
    </div>
  )
}
