import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('login') // login | signup | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setSuccess('Te enviamos un correo para restablecer tu contraseña.')
      } else if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
        setSuccess('Cuenta creada. Revisa tu email para confirmarla.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setError(null)
    setSuccess(null)
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

        {mode === 'forgot' ? (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '8px' }}>
              Restablecer contraseña
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Te enviaremos un correo con instrucciones.
            </p>
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
              {error && <ErrorBox msg={error} />}
              {success && <SuccessBox msg={success} />}
              <Button type="submit" loading={loading} style={{ marginTop: '8px' }}>
                Enviar correo
              </Button>
            </form>
            <button onClick={() => switchMode('login')} style={linkStyle}>
              ← Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
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
              <div>
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>

              {error && <ErrorBox msg={error} />}
              {success && <SuccessBox msg={success} />}

              <Button type="submit" loading={loading} style={{ marginTop: '8px' }}>
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </form>

            <button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              style={linkStyle}
            >
              {mode === 'login'
                ? '¿No tienes cuenta? Crear una gratis'
                : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const linkStyle = {
  width: '100%',
  marginTop: '16px',
  padding: '12px',
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  fontSize: '14px',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  textAlign: 'center',
  display: 'block',
}

function ErrorBox({ msg }) {
  return (
    <p style={{
      padding: '10px 14px',
      background: '#f8514922',
      border: '1px solid var(--color-danger)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-danger)',
      fontSize: '13px',
    }}>
      {msg}
    </p>
  )
}

function SuccessBox({ msg }) {
  return (
    <p style={{
      padding: '10px 14px',
      background: '#39d35322',
      border: '1px solid var(--color-accent)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-accent)',
      fontSize: '13px',
    }}>
      {msg}
    </p>
  )
}
