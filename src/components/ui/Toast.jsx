import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 16px)',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const typeStyles = {
  success: { background: 'var(--color-accent)', color: '#0d1117' },
  error: { background: 'var(--color-danger)', color: '#fff' },
  warning: { background: 'var(--color-warning)', color: '#0d1117' },
  info: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
}

function ToastItem({ message, type }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'fadeIn 0.2s ease',
      pointerEvents: 'auto',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      ...typeStyles[type],
    }}>
      {message}
    </div>
  )
}
