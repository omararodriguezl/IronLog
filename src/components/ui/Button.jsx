import React from 'react'

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '52px',
    padding: '12px 20px',
    borderRadius: 'var(--radius-lg)',
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    transition: 'all 0.15s ease',
    border: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  primary: {
    background: 'var(--color-accent)',
    color: '#0d1117',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#fff',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
  },
  small: {
    minHeight: '40px',
    padding: '8px 16px',
    fontSize: '13px',
  },
  icon: {
    width: '44px',
    minHeight: '44px',
    padding: '0',
    borderRadius: 'var(--radius-md)',
    fontSize: '18px',
  },
  disabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
}

export default function Button({
  children,
  variant = 'primary',
  size,
  disabled,
  loading,
  onClick,
  type = 'button',
  style: customStyle,
  ...props
}) {
  const combinedStyle = {
    ...styles.base,
    ...styles[variant],
    ...(size === 'small' ? styles.small : {}),
    ...(size === 'icon' ? styles.icon : {}),
    ...(disabled || loading ? styles.disabled : {}),
    ...customStyle,
  }

  return (
    <button
      type={type}
      style={combinedStyle}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span style={{
          width: '18px',
          height: '18px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : children}
    </button>
  )
}
