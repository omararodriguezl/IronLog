import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import { useNutrition } from '../hooks/useNutrition'
import { useCardio } from '../hooks/useCardio'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { cardioColors, cardioLabels } from '../theme'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { activePlan, sessions, getTodaysSession, getCurrentWeekData } = useWorkout(profile?.id)
  const { getTotals, goals } = useNutrition(profile?.id)
  const { getTodaysSession: getTodaysCardio } = useCardio(profile?.id)

  const todaysGym = getTodaysSession()
  const todaysCardio = getTodaysCardio()
  const weekData = getCurrentWeekData()
  const macroTotals = getTotals()
  const calPct = Math.min(Math.round((macroTotals.calories / goals.calories) * 100), 100)

  const today = new Date()
  const greeting = getGreeting()
  const name = profile?.name || profile?.id?.slice(0, 6) || 'Atleta'

  const streak = calculateStreak(sessions)

  return (
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{
        padding: '20px 0 16px',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '20px',
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '2px' }}>
          {today.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
          {greeting}, {name}
        </h1>
      </div>

      {streak > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'var(--color-accent-dim)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-accent)',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '24px' }}>🔥</span>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--color-accent)' }}>
              {streak} días consecutivos
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>¡Sigue así!</p>
          </div>
        </div>
      )}

      {activePlan && weekData && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                Semana {activePlan.current_week} de {activePlan.plan_json?.total_weeks}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700' }}>
                {weekData.theme}
              </h2>
              {weekData.is_deload && (
                <span style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '2px 8px',
                  background: '#d2992222',
                  border: '1px solid var(--color-warning)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  color: 'var(--color-warning)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '600',
                  letterSpacing: '0.04em',
                }}>
                  SEMANA DELOAD
                </span>
              )}
            </div>
          </div>

          {todaysGym ? (
            <div style={{
              padding: '12px',
              background: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '12px',
            }}>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Sesión de hoy
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700' }}>
                {todaysGym.day_label}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {todaysGym.exercises?.length} ejercicios · ~{activePlan.plan_json?.session_duration_minutes} min
              </p>
            </div>
          ) : null}

          <Button onClick={() => navigate('/workout')}>
            💪 Empezar entrenamiento
          </Button>
        </Card>
      )}

      {!activePlan && (
        <Card style={{ marginBottom: '16px', textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📋</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '4px' }}>
            Sin plan activo
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Completa el perfil para generar tu programa
          </p>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            Configurar perfil
          </Button>
        </Card>
      )}

      {todaysCardio && (
        <Card style={{ marginBottom: '16px', borderLeft: `3px solid ${cardioColors[todaysCardio.session_type]}` }}>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Cardio hoy
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: cardioColors[todaysCardio.session_type] }}>
            {cardioLabels[todaysCardio.session_type]}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {todaysCardio.description || `${todaysCardio.distance_miles} millas`}
          </p>
          {todaysGym && ['intervals', 'long_run'].includes(todaysCardio.session_type) &&
            todaysGym.day_label?.toLowerCase().includes('pierna') && (
            <p style={{
              marginTop: '8px',
              padding: '8px 10px',
              background: '#d2992222',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--color-warning)',
            }}>
              ⚠️ Cardio intenso programado junto con día de piernas
            </p>
          )}
        </Card>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Nutrición hoy
          </p>
          <button onClick={() => navigate('/nutrition')} style={{
            fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}>
            Ver →
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700' }}>
                {Math.round(macroTotals.calories)}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', alignSelf: 'flex-end' }}>
                / {goals.calories} kcal
              </span>
            </div>
            <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${calPct}%`,
                background: calPct >= 90 ? 'var(--color-accent)' : 'var(--color-warning)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: calPct >= 90 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
            {calPct}%
          </span>
        </div>
      </Card>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function calculateStreak(sessions) {
  if (!sessions?.length) return 0
  const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().split('T')[0]
  if (dates[0] !== today && dates[0] !== getPrevDay(today)) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] === getPrevDay(dates[i - 1])) streak++
    else break
  }
  return streak
}

function getPrevDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}
