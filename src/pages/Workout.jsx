import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import { useCoach } from '../hooks/useCoach'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ExerciseCard from '../components/workout/ExerciseCard'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { muscleGroupColors } from '../theme'

export default function Workout() {
  const { profile } = useAuth()
  const { activePlan, sessions, saveSession, getCurrentWeekData, getTodaysSession, loading } = useWorkout(profile?.id)
  const { analyze } = useCoach(profile?.id)
  const toast = useToast()

  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [exerciseSets, setExerciseSets] = useState({})
  const [saving, setSaving] = useState(false)
  const [useKg, setUseKg] = useState(true)
  const [selectedDayIdx, setSelectedDayIdx] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [expandedSession, setExpandedSession] = useState(null)
  const intervalRef = useRef(null)

  const weekData = getCurrentWeekData()
  const allDays = activePlan?.plan_json?.days || weekData?.days || []
  const todayDefault = getTodaysSession()
  const dayIdx = selectedDayIdx ?? (allDays.indexOf(todayDefault) ?? 0)
  const currentDay = allDays[dayIdx] || null

  const today = new Date().toISOString().split('T')[0]

  // Which days have been completed this week
  const completedDayLabels = new Set(
    sessions
      .filter(s => s.week_number === activePlan?.current_week)
      .map(s => s.day_label)
  )

  // Is current day already done today?
  const todaySessionDone = sessions.some(
    s => s.date === today && s.day_label === currentDay?.day_label
  )

  // Week completion
  const weekDaysTotal = allDays.length
  const weekDaysDone = allDays.filter(d => completedDayLabels.has(d.day_label)).length
  const weekComplete = weekDaysTotal > 0 && weekDaysDone >= weekDaysTotal

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning])

  function formatTime(secs) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  function handleSetsUpdate(exerciseId, sets) {
    setExerciseSets(prev => ({ ...prev, [exerciseId]: sets }))
  }

  async function handleFinishSession() {
    if (!currentDay) return
    setSaving(true)
    try {
      const exercises = currentDay.exercises.map(ex => ({
        name: ex.name,
        sets: exerciseSets[ex.id] || [],
      }))
      await saveSession({
        plan_id: activePlan.id,
        date: today,
        day_label: currentDay.day_label,
        week_number: activePlan.current_week,
        duration_minutes: Math.round(elapsed / 60),
        exercises,
      })
      setTimerRunning(false)
      setElapsed(0)
      setExerciseSets({})
      toast.success('¡Sesión guardada! 💪')
      analyze(profile, activePlan).catch(() => {})
    } catch (err) {
      toast.error('Error guardando sesión: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner size={40} /></div>
  }

  if (!activePlan) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '8px' }}>Sin plan activo</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Configura tu perfil para generar tu programa</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>

      {/* Header */}
      <div style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Semana {activePlan.current_week}/{activePlan.plan_json?.total_weeks} · {weekData?.is_deload ? '🔄 DELOAD' : weekData?.theme}
              </p>
              {weekComplete && (
                <span style={{
                  padding: '2px 8px',
                  background: 'var(--color-accent-dim)',
                  border: '1px solid var(--color-accent)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  color: 'var(--color-accent)',
                  letterSpacing: '0.05em',
                }}>
                  ✓ SEMANA COMPLETA
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginTop: '2px' }}>
              {currentDay?.day_label || 'Sin sesión'}
              {todaySessionDone && <span style={{ color: 'var(--color-accent)', marginLeft: '8px', fontSize: '18px' }}>✓</span>}
            </h1>
            {weekData?.progression_note && (
              <p style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '3px' }}>
                📈 {weekData.progression_note}
              </p>
            )}
          </div>
          <button
            onClick={() => setUseKg(k => !k)}
            style={{
              padding: '6px 12px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {useKg ? 'KG' : 'LBS'}
          </button>
        </div>
      </div>

      {/* Week progress bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Progreso semana
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
            {weekDaysDone}/{weekDaysTotal}
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: weekDaysTotal > 0 ? `${(weekDaysDone / weekDaysTotal) * 100}%` : '0%',
            background: weekComplete ? 'var(--color-accent)' : 'var(--color-accent)',
            borderRadius: '2px',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Day selector tabs */}
      {allDays.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
          {allDays.map((day, i) => {
            const done = completedDayLabels.has(day.day_label)
            const active = dayIdx === i
            return (
              <button
                key={i}
                onClick={() => setSelectedDayIdx(i)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${active ? 'var(--color-accent)' : done ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-accent-dim)' : done ? '#1a4a2655' : 'var(--color-surface)',
                  color: active ? 'var(--color-accent)' : done ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: done && !active ? 0.7 : 1,
                }}
              >
                {done ? '✓ ' : ''}{day.day_label?.split('–')[0]?.trim() || `Día ${i + 1}`}
              </button>
            )
          })}
        </div>
      )}

      {/* Timer */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Tiempo de sesión
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', marginTop: '2px' }}>
              {formatTime(elapsed)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTimerRunning(r => !r)}
              style={{
                minHeight: '44px', padding: '0 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: timerRunning ? 'var(--color-surface-hover)' : 'var(--color-accent)',
                color: timerRunning ? 'var(--color-text)' : '#0d1117',
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '700',
                letterSpacing: '0.05em', cursor: 'pointer',
              }}
            >
              {timerRunning ? 'PAUSAR' : elapsed === 0 ? 'INICIAR' : 'REANUDAR'}
            </button>
            {elapsed > 0 && !timerRunning && (
              <button onClick={() => setElapsed(0)} style={{ minHeight: '44px', width: '44px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '16px' }}>↺</button>
            )}
          </div>
        </div>
      </Card>

      {/* Already done banner */}
      {todaySessionDone && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--color-accent-dim)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-accent)', fontWeight: '600' }}>
            Ya completaste esta sesión hoy
          </p>
        </div>
      )}

      {/* Exercises */}
      {currentDay?.exercises?.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          useKg={useKg}
          onSetsUpdate={handleSetsUpdate}
        />
      ))}

      {currentDay && (
        <div style={{ marginTop: '8px', marginBottom: '32px' }}>
          <Button onClick={handleFinishSession} loading={saving} variant={todaySessionDone ? 'ghost' : 'primary'}>
            {todaySessionDone ? '🔁 Registrar otra sesión' : '✅ Finalizar sesión'}
          </Button>
        </div>
      )}

      {/* History section */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
        <button
          onClick={() => setShowHistory(h => !h)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: showHistory ? '16px' : '0',
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Historial de entrenos
          </span>
          <span style={{ fontSize: '18px', color: 'var(--color-text-muted)', transition: 'transform 0.2s', transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ↓
          </span>
        </button>

        {showHistory && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {sessions.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                Sin sesiones registradas aún
              </p>
            ) : (
              sessions.map(session => (
                <SessionHistoryCard
                  key={session.id}
                  session={session}
                  expanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(id => id === session.id ? null : session.id)}
                  useKg={useKg}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionHistoryCard({ session, expanded, onToggle, useKg }) {
  const totalVolume = (session.exercises || []).reduce((acc, ex) =>
    acc + (ex.sets || []).reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0)

  const totalSets = (session.exercises || []).reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)

  return (
    <Card style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={onToggle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              padding: '2px 8px',
              background: 'var(--color-accent-dim)',
              borderRadius: 'var(--radius-full)',
            }}>
              Sem {session.week_number}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--color-text)' }}>
            {session.day_label}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {new Date(session.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
            {session.duration_minutes > 0 && ` · ${session.duration_minutes} min`}
          </p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {totalVolume > 0 && (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--color-text)' }}>
                {totalVolume.toLocaleString()}{useKg ? 'kg' : 'lbs'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>volumen total</p>
            </>
          )}
          {totalSets > 0 && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {totalSets} series
            </p>
          )}
        </div>
      </div>

      {expanded && (session.exercises || []).length > 0 && (
        <div style={{ marginTop: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
          {session.exercises.map((ex, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '5px' }}>
                {ex.name}
              </p>
              {(ex.sets || []).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {ex.sets.map((set, j) => (
                    <span key={j} style={{
                      padding: '3px 10px',
                      background: 'var(--color-surface-hover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {set.reps} × {set.weight}{useKg ? 'kg' : 'lbs'}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Sin sets registrados</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
