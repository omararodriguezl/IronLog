import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './Icon'

const TABS = [
  { path: '/',          id: 'home',   label: 'INICIO',    icon: 'home'     },
  { path: '/workout',   id: 'gym',    label: 'GYM',       icon: 'dumbbell' },
  { path: '/nutrition', id: 'nutri',  label: 'NUTRICIÓN', icon: 'fork'     },
  { path: '/cardio',    id: 'cardio', label: 'CARDIO',    icon: 'run'      },
  { path: '/profile',   id: 'perfil', label: 'PERFIL',    icon: 'user'     },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      height: 'calc(var(--nav-height) + var(--safe-bottom))',
      borderTop: '1px solid var(--line)',
      background: 'color-mix(in oklab, var(--bg) 92%, transparent)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      paddingTop: '10px',
      paddingBottom: 'var(--safe-bottom)',
    }}>
      {TABS.map(tab => {
        const active = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path))
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'transparent',
              border: 0,
              color: active ? 'var(--acc)' : 'var(--ink-3)',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 0',
              transition: 'color 0.15s ease',
            }}
          >
            <Icon name={tab.icon} size={22} stroke={active ? 2 : 1.6} color="currentColor" />
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
