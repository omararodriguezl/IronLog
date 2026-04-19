import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext, useAuthProvider } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import { FullPageSpinner } from './components/ui/Spinner'
import BottomNav from './components/ui/BottomNav'

import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Nutrition from './pages/Nutrition'
import Cardio from './pages/Cardio'
import Coach from './pages/Coach'
import Profile from './pages/Profile'

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
      <main style={{
        flex: 1,
        paddingTop: 'calc(var(--safe-top))',
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
