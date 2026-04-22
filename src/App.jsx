import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, useAuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import { FullPageSpinner } from './components/ui/Spinner'
import BottomNav from './components/ui/BottomNav'
import Icon from './components/ui/Icon'
import { useTheme } from './hooks/useTheme'

import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Nutrition from './pages/Nutrition'
import Cardio from './pages/Cardio'
import Coach from './pages/Coach'
import Profile from './pages/Profile'

function TopBar() {
  const { theme, toggle } = useTheme()
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 101,
      height: 'calc(var(--safe-top) + 52px)',
      paddingTop: 'var(--safe-top)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--safe-top) 20px 0',
      background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--line)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        Iron Log
      </span>
      <button
        onClick={toggle}
        style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink-3)' }}
        aria-label="Toggle theme"
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} color="currentColor" stroke={1.6} />
      </button>
    </div>
  )
}

function AppShell({ children }) {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <TopBar />
      <main style={{
        flex: 1,
        paddingBottom: 'calc(var(--nav-height) + var(--safe-bottom) + 8px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

function ProtectedApp() {
  const auth = useAuthProvider()

  if (auth.loading) return <FullPageSpinner />

  if (!auth.user) {
    return (
      <AuthContext.Provider value={auth}>
        <Auth />
      </AuthContext.Provider>
    )
  }

  if (!auth.profile) {
    return (
      <AuthContext.Provider value={auth}>
        <Onboarding onComplete={() => auth.fetchProfile(auth.user.id)} />
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/cardio" element={<Cardio />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <ProtectedApp />
    </ToastProvider>
  )
}
