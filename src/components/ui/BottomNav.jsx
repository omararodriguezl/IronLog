import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', label: 'Inicio', icon: HomeIcon },
  { path: '/workout', label: 'Gym', icon: DumbbellIcon },
  { path: '/nutrition', label: 'Nutrición', icon: ForkIcon },
  { path: '/cardio', label: 'Cardio', icon: RunIcon },
  { path: '/coach', label: 'Coach', icon: BrainIcon },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      paddingBottom: 'var(--safe-bottom)',
      backdropFilter: 'blur(12px)',
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path))
        const Icon = tab.icon
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '10px 4px',
              minHeight: 'var(--nav-height)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={22} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

function HomeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
}

function DumbbellIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11M6 12h12M4 9.5a1 1 0 0 1 0-2h2v5H4a1 1 0 0 1 0-2M20 9.5a1 1 0 0 0 0-2h-2v5h2a1 1 0 0 0 0-2"/>
      <rect x="6" y="7.5" width="2" height="9" rx="1"/>
      <rect x="16" y="7.5" width="2" height="9" rx="1"/>
    </svg>
  )
}

function ForkIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  )
}

function RunIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="2"/>
      <path d="M7 22L10 12 7 8h10"/>
      <path d="M10 12l4 2 3 6"/>
    </svg>
  )
}

function BrainIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  )
}
