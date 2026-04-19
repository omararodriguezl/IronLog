import React, { useMemo } from 'react'
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
  const { sessions: cardioSessions, getTodaysSession: getTodaysCardio } = useCardio(profile?.id)

  const todaysGym = getTodaysSession()
  const todaysCardio = getTodaysCardio()
  const weekData = getCurrentWeekData()
  const macros = getTotals()

  const today = new Date()
  const name = profile?.name || 'Atleta'
  const streak = useMemo(() => calculateStreak(sessions), [sessions])

  const lastSession = sessions?.[0] || null
  const lastSessionVolume = useMemo(() => calcVolume(lastSession), [lastSession])

  const weekDays = useMemo(() => buildWeekDays(activePlan, sessions), [activePlan, sessions])

  const upcomingCardio = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0]
    return cardioSessions
      .filter(s => s.date >= todayStr)
      .slice(0, 3)
  }, [cardioSessions, today])

  const planPct = activePlan
    ? Math.round(((activePlan.current_week - 1) / activePlan.plan_json?.total_weeks) * 100)
    : 0

  const sessionsThisMonth = useMemo(() => {
    const monthStr = today.toISOString().slice(0, 7)
    return sessions.filter(s => s.date?.startsWith(monthStr)).length
  }, [sessions, today])

  const calPct = Math.min(Math.round((macros.calories / goals.calories) * 100), 100)
  const protPct = Math.min(Math.round((macros.protein_g / goals.protein_g) * 100), 100)
  const carbPct = Math.min(Math.round((macros.carbs_g / goals.carbs_g) * 100), 100)
  const fatPct = Math.min(Math.round((macros.fat_g / goals.fat_g) * 100), 100)

  return (
    <div style={{ padding: '0 16px 32px', animation: 'fadeIn 0.2s ease' }}>

      {/* Header */}
      <div style={{ padding: '20px 0 16px', marginBottom: '4px' }}>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '12px', letterSpacing: '0.04em', marginBottom: '2px' }}>
          {today.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', lineHeight: 1.1 }}>
          {getGreeting()}, {name}
        </h1>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <StatTile
          icon="🔥"
          value={streak}
          label="racha"
          accent={streak > 0}
        />
        <StatTile
          icon="📅"
          value={sessionsThisMonth}
          label="este mes"
        />
        <StatTile
          icon="🏆"
          value={sessions.length}
          label="total"
        />
      </div>

      {/* Today's training */}
      {activePlan ? (
        <Card style={{ marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          {/* Accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-dim))',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                {weekData?.is_deload ? '⚡ SEMANA DELOAD' : `SEMANA ${activePlan.current_week} / ${activePlan.plan_json?.total_weeks}`}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700' }}>
                {weekData?.theme || 'Entrenamiento'}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginBottom: '3px' }}>{planPct}%</p>
              <div style={{ width: '64px', height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${planPct}%`, background: 'var(--color-accent)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>

          {/* Week day tiles */}
          {weekDays.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              {weekDays.map((d, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: d.done
                    ? 'var(--color-accent)'
                    : d.isToday
                      ? 'var(--color-accent-dim)'
                      : 'var(--color-border)',
                  border: d.isToday ? '1px solid var(--color-accent)' : 'none',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          )}

          {todaysGym ? (
            <div style={{
              padding: '12px',
              background: 'var(--color-surface-hover)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700' }}>
                  {todaysGym.day_label}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                  ~{activePlan.plan_json?.session_duration_minutes} min
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {todaysGym.exercises?.slice(0, 5).map((ex, i) => (
                  <span key={i} style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.02em',
                  }}>
                    {ex.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px 12px', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Día de descanso activo</p>
            </div>
          )}

          <Button onClick={() => navigate('/workout')} style={{ width: '100%' }}>
            💪 Ir al entrenamiento
          </Button>
        </Card>
      ) : (
        <Card style={{ marginBottom: '16px', textAlign: 'center', padding: '28px 24px' }}>
          <p style={{ fontSize: '36px', marginBottom: '10px' }}>📋</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>
            Sin plan activo
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
            Completa tu perfil para generar un programa personalizado con IA
          </p>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            🚀 Configurar perfil
          </Button>
        </Card>
      )}

      {/* Today's cardio */}
      {todaysCardio && (
        <Card style={{
          marginBottom: '16px',
          borderLeft: `3px solid ${cardioColors[todaysCardio.session_type] || 'var(--color-accent)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                Cardio hoy
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: cardioColors[todaysCardio.session_type] }}>
                {cardioLabels[todaysCardio.session_type]}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {todaysCardio.description || `${todaysCardio.distance_miles} millas`}
              </p>
            </div>
            <div style={{
              width: '44px', height: '44px',
              borderRadius: '50%',
              background: `${cardioColors[todaysCardio.session_type]}22`,
              border: `1px solid ${cardioColors[todaysCardio.session_type]}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>
              {cardioIcon(todaysCardio.session_type)}
            </div>
          </div>
          {todaysGym && ['intervals', 'long_run'].includes(todaysCardio.session_type) &&
            todaysGym.day_label?.toLowerCase().includes('pierna') && (
            <p style={{ marginTop: '10px', padding: '8px 10px', background: '#d2992222', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--color-warning)' }}>
              ⚠️ Cardio intenso + día de piernas — considera el orden
            </p>
          )}
        </Card>
      )}

      {/* Nutrition */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Nutrición hoy
          </p>
          <button onClick={() => navigate('/nutrition')} style={{
            fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
          }}>
            VER →
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', lineHeight: 1 }}>
            {Math.round(macros.calories)}
          </span>
          <span style={{ color: 'var(--color-text-dim)', fontSize: '12px', marginBottom: '3px' }}>
            / {goals.calories} kcal
          </span>
        </div>
        <MacroBar pct={calPct} color="var(--color-accent)" style={{ marginBottom: '14px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <MacroStat label="Proteína" value={Math.round(macros.protein_g)} unit="g" pct={protPct} color="#4ade80" />
          <MacroStat label="Carbos" value={Math.round(macros.carbs_g)} unit="g" pct={carbPct} color="#facc15" />
          <MacroStat label="Grasa" value={Math.round(macros.fat_g)} unit="g" pct={fatPct} color="#f97316" />
        </div>
      </Card>

      {/* Last session */}
      {lastSession && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Última sesión
            </p>
            <button onClick={() => navigate('/workout')} style={{
              fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
            }}>
              HISTORIAL →
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', marginBottom: '3px' }}>
            {lastSession.day_label}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginBottom: '10px' }}>
            {formatDate(lastSession.date)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <MiniStat value={lastSession.exercises?.length || 0} label="ejerc." />
            <MiniStat value={countSets(lastSession)} label="series" />
            <MiniStat value={lastSessionVolume > 0 ? `${(lastSessionVolume / 1000).toFixed(1)}t` : '—'} label="volumen" />
          </div>
        </Card>
      )}

      {/* Upcoming cardio */}
      {upcomingCardio.length > 1 && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Próximo cardio
            </p>
            <button onClick={() => navigate('/cardio')} style={{
              fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
            }}>
              VER →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingCardio.slice(0, 3).map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px',
                background: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${cardioColors[s.session_type] || 'var(--color-border)'}`,
              }}>
                <span style={{ fontSize: '16px' }}>{cardioIcon(s.session_type)}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: '600', color: cardioColors[s.session_type] }}>
                    {cardioLabels[s.session_type]}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                    {formatDate(s.date)} · {s.distance_miles} mi
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Plan progression note */}
      {weekData?.progression_note && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--color-accent-dim)',
          borderRadius: 'var(--radius-lg)',
          borderLeft: '3px solid var(--color-accent)',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Progresión esta semana
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text)', lineHeight: '1.5' }}>
            {weekData.progression_note}
          </p>
        </div>
      )}
    </div>
  )
}

// --- Sub-components ---

function StatTile({ icon, value, label, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--color-accent-dim)' : 'var(--color-surface-hover)',
      border: `1px solid ${accent ? 'var(--color-accent)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '12px 8px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '18px', marginBottom: '2px' }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: accent ? 'var(--color-accent)' : 'var(--color-text)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginTop: '2px' }}>
        {label}
      </div>
    </div>
  )
}

function MacroBar({ pct, color, style }) {
  return (
    <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', ...style }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
    </div>
  )
}

function MacroStat({ label, value, unit, pct, color }) {
  return (
    <div style={{ background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', padding: '8px', border: '1px solid var(--color-border)' }}>
      <p style={{ fontSize: '10px', fontFamily: 'var(--font-display)', color: 'var(--color-text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color, lineHeight: 1, marginBottom: '6px' }}>
        {value}<span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--color-text-dim)', marginLeft: '2px' }}>{unit}</span>
      </p>
      <MacroBar pct={pct} color={color} />
    </div>
  )
}

function MiniStat({ value, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', lineHeight: 1, marginBottom: '2px' }}>{value}</p>
      <p style={{ fontSize: '10px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{label}</p>
    </div>
  )
}

// --- Helpers ---

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
  const yesterday = getPrevDay(today)
  if (dates[0] !== today && dates[0] !== yesterday) return 0
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

function calcVolume(session) {
  if (!session?.exercises) return 0
  return session.exercises.reduce((total, ex) => {
    return total + (ex.sets || []).reduce((s, set) => s + ((set.reps || 0) * (set.weight || 0)), 0)
  }, 0)
}

function countSets(session) {
  if (!session?.exercises) return 0
  return session.exercises.reduce((total, ex) => total + (ex.sets?.length || 0), 0)
}

function buildWeekDays(activePlan, sessions) {
  if (!activePlan?.plan_json?.days) return []
  const days = activePlan.plan_json.days
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Get Monday of current week
  const dow = today.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  return days.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const done = sessions?.some(s => s.date === dateStr) ?? false
    const isToday = dateStr === todayStr
    return { dateStr, done, isToday }
  })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
}

function cardioIcon(type) {
  const icons = {
    easy_run: '🏃',
    intervals: '⚡',
    tempo: '🎯',
    long_run: '🛤️',
    race: '🏅',
    rest: '😴',
  }
  return icons[type] || '🏃'
}
