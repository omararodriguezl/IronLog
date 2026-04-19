import React, { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, fullscreen }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: fullscreen ? 'stretch' : 'flex-end',
        justifyContent: 'center',
        padding: fullscreen ? 0 : '0',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'relative',
          background: 'var(--color-surface)',
          borderRadius: fullscreen ? 0 : 'var(--radius-xl) var(--radius-xl) 0 0',
          width: '100%',
          maxWidth: fullscreen ? '100%' : '600px',
          maxHeight: fullscreen ? '100dvh' : '90dvh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s ease',
          paddingBottom: 'var(--safe-bottom)',
          overflowY: 'auto',
        }}
      >
        {(title || onClose) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 0',
            flexShrink: 0,
          }}>
            {title && (
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-muted)',
                fontSize: '18px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
