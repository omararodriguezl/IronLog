import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import { useNutrition } from '../hooks/useNutrition'
import { useCardio } from '../hooks/useCardio'
import Icon from '../components/ui/Icon'
import Ring from '../components/ui/Ring'
import { cardioLabels } from '../theme'

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { activePlan, sessions, getTodaysSession, getCurrentWeekData } = useWorkout(profile?.id)
  const { getTotals, goals } = useNutrition(profile?.id)
  const { sessions: cardioSessions, getTodaysSession: getTodaysCardio } = useCardio(profile?.id)

  const todaysGym    = getTodaysSession()
  const todaysCardio = getTodaysCardio()
  const weekData     = getCurrentWeekData()
  const macros       = getTotals()

  const today = new Date()
  const name  = profile?.name?.split(' ')[0] || 'Atleta'
  const streak = useMemo(() => calculateStreak(sessions), [sessions])

  const sessionsThisMonth = useMemo(() => {
    const m = today.toISOString().slice(0, 7)
    return sessions.filter(s => s.date?.startsWith(m)).length
  }, [sessions, today])

  const planPct = activePlan
    ? Math.round(((activePlan.current_week - 1) / (activePlan.plan_json?.total_weeks || 1)) * 100)
    : 0

  const calPct  = Math.min((macros.calories / goals.calories), 1)
  const nextCardio = useMemo(() => {
    const t = today.toISOString().split('T')[0]
    return cardioSessions.filter(s => s.date > t)[0] || null
  }, [cardioSessions, today])

  const lastSession = sessions[0] || null

  return (
    <div className="iron-in" style={{ padding: '0 20px 32px', paddingTop: 'calc(var(--safe-top) + 60px)' }}>

      {/* ── Header ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div className="eyebrow">{formatDayDate(today)}</div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, marginTop: 4, lineHeight: 1.1 }}>
            {getGreeting()},
            <div style={{ color: 'var(--ink-3)' }}>{name}.</div>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14, background: streak > 0 ? 'linear-gradient(180deg, var(--acc-soft), transparent 80%), var(--bg-1)' : 'var(--bg-1)', borderColor: streak > 0 ? 'color-mix(in oklch, var(--acc) 30%, transparent)' : 'var(--line)' }}>
          <div className="eyebrow" style={{ color: streak > 0 ? 'var(--acc)' : 'var(--ink-3)' }}>Racha</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
            <span className="mono tabular" style={{ fontSize: 34, fontWeight: 600, color: streak > 0 ? 'var(--acc)' : 'var(--ink)', lineHeight: 1 }}>{streak}</span>
            <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>días</span>
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow">Mes</div>
          <div className="mono tabular" style={{ fontSize: 26, fontWeight: 500, marginTop: 8 }}>{sessionsThisMonth}<span style={{ color: 'var(--ink-4)', fontSize: 14 }}> ses.</span></div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="eyebrow">Total</div>
          <div className="mono tabular" style={{ fontSize: 26, fontWeight: 500, marginTop: 8 }}>{sessions.length}</div>
        </div>
      </div>

      {/* ── Today's session — inverted hero card ────── */}
      {activePlan ? (
        <div style={{
          marginBottom: 16,
          background: 'var(--hero-bg)',
          color: 'var(--hero-ink)',
          borderRadius: 'var(--r-xl)',
          padding: '24px 22px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="eyebrow" style={{ color: 'var(--hero-ink-2)' }}>
              Semana {activePlan.current_week}/{activePlan.plan_json?.total_weeks} · {weekData?.theme || 'Entrenamiento'}
            </div>
            <span className="mono tabular" style={{ fontSize: 11, color: 'var(--hero-ink-2)' }}>
              ~{activePlan.plan_json?.session_duration_minutes || '—'} MIN
            </span>
          </div>

          {todaysGym ? (
            <>
              <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, marginTop: 14, lineHeight: 1.15 }}>
                {todaysGym.day_label?.split('–')[0]?.trim() || 'Sesión de hoy'}
                {todaysGym.day_label?.includes('–') && (
                  <div style={{ color: 'var(--hero-ink-2)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 22 }}>
                    {todaysGym.day_label.split('–')[1]?.trim()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
                {(todaysGym.exercises || []).slice(0, 5).map((ex, i) => (
                  <span key={i} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--hero-chip-bg)', fontSize: 12, color: 'var(--hero-ink-3)' }}>
                    {ex.name}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 14, color: 'var(--hero-ink-2)' }}>Día de descanso</div>
          )}

          {/* Plan progress bar */}
          <div style={{ height: 3, background: 'rgba(0,0,0,0.1)', borderRadius: 2, margin: '18px 0 16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${planPct}%`, background: 'var(--hero-ink)', borderRadius: 2, transition: 'width .4s ease' }} />
          </div>

          <button
            onClick={() => navigate('/workout')}
            style={{ width: '100%', height: 50, borderRadius: 14, background: 'var(--bg)', color: 'var(--acc)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
          >
            Ir al entrenamiento <Icon name="arrowR" size={16} />
          </button>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Sin plan activo</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>Configura tu perfil para generar un programa con IA</div>
          <button onClick={() => navigate('/profile')} style={{ padding: '10px 24px', borderRadius: 999, background: 'var(--acc)', color: 'var(--acc-ink)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Configurar perfil
          </button>
        </div>
      )}

      {/* ── AI progression note ─────────────────── */}
      {weekData?.progression_note && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--acc-soft)', border: '1px solid color-mix(in oklch, var(--acc) 25%, transparent)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="sparkle" size={16} color="var(--acc)" stroke={2} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            {weekData.progression_note}
          </div>
        </div>
      )}

      {/* ── Compact nutri + cardio ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => navigate('/nutrition')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow">Nutrición</span>
            <Icon name="chevronR" size={14} color="var(--ink-3)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Ring value={calPct} size={44} stroke={4} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="mono tabular" style={{ fontSize: 10, fontWeight: 600 }}>{Math.round(calPct * 100)}%</span>
              </div>
            </div>
            <div>
              <div className="mono tabular" style={{ fontSize: 18, fontWeight: 500 }}>{Math.round(macros.calories)}</div>
              <div className="mono tabular" style={{ fontSize: 10, color: 'var(--ink-3)' }}>/ {goals.calories} kcal</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => navigate('/cardio')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow">{todaysCardio ? 'Cardio hoy' : 'Próx. Cardio'}</span>
            <Icon name="chevronR" size={14} color="var(--ink-3)" />
          </div>
          <div style={{ marginTop: 10 }}>
            {(todaysCardio || nextCardio) ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{cardioLabels[(todaysCardio || nextCardio).session_type]}</div>
                <div className="mono tabular" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {todaysCardio ? 'HOY' : formatShortDate((nextCardio).date)} · {((todaysCardio || nextCardio).distance_miles || '—')} MI
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Sin sesión</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Last session ────────────────────────── */}
      {lastSession && (
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate('/workout')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="eyebrow">Última sesión</span>
            <Icon name="arrowR" size={14} color="var(--ink-3)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{lastSession.day_label}</div>
          <div className="eyebrow" style={{ marginTop: 4 }}>{formatShortDate(lastSession.date)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            <MiniStat value={lastSession.exercises?.length || 0} label="ejerc." />
            <MiniStat value={countSets(lastSession)} label="series" />
            <MiniStat value={fmtVolume(lastSession)} label="volumen" />
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ value, label }) {
  return (
    <div style={{ padding: '8px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
      <div className="mono tabular" style={{ fontSize: 17, fontWeight: 500 }}>{value}</div>
      <div className="eyebrow" style={{ marginTop: 2 }}>{label}</div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDayDate(d) {
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}

function calculateStreak(sessions) {
  if (!sessions?.length) return 0
  const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().split('T')[0]
  const prev = getPrevDay(today)
  if (dates[0] !== today && dates[0] !== prev) return 0
  let s = 1
  for (let i = 1; i < dates.length; i++) {
    if (dates[i] === getPrevDay(dates[i - 1])) s++
    else break
  }
  return s
}

function getPrevDay(d) {
  const dt = new Date(d + 'T00:00:00')
  dt.setDate(dt.getDate() - 1)
  return dt.toISOString().split('T')[0]
}

function countSets(session) {
  return (session?.exercises || []).reduce((a, ex) => a + (ex.sets?.length || 0), 0)
}

function fmtVolume(session) {
  const v = (session?.exercises || []).reduce((a, ex) =>
    a + (ex.sets || []).reduce((s, set) => s + (set.reps || 0) * (set.weight || 0), 0), 0)
  if (!v) return '—'
  return v >= 1000 ? `${(v / 1000).toFixed(1)}t` : `${v}kg`
}
