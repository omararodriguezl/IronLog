import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') await signInWithEmail(email, password)
      else await signUpWithEmail(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-bg)',
      paddingTop: 'calc(var(--safe-top) + 24px)',
      paddingBottom: 'calc(var(--safe-bottom) + 24px)',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🏋️</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '40px',
            fontWeight: '700',
            color: 'var(--color-accent)',
            letterSpacing: '0.05em',
          }}>
            IRON LOG
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Tu entrenador personal con IA
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />

          {error && (
            <p style={{
              padding: '10px 14px',
              background: '#f8514922',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: '13px',
            }}>
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} style={{ marginTop: '8px' }}>
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </Button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null) }}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {mode === 'login'
            ? '¿No tienes cuenta? Crear una gratis'
            : '¿Ya tienes cuenta? Iniciar sesión'}
        </button>
      </div>
    </div>
  )
}
