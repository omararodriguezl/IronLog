import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import { useCoach } from '../hooks/useCoach'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ExerciseCard from '../components/workout/ExerciseCard'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

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
  const intervalRef = useRef(null)

  const weekData = getCurrentWeekData()
  const allDays = activePlan?.plan_json?.days || weekData?.days || []
  const todayDefault = getTodaysSession()

  const dayIdx = selectedDayIdx ?? (allDays.indexOf(todayDefault) ?? 0)
  const currentDay = allDays[dayIdx] || null

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

      const totalVolume = exercises.reduce((acc, ex) =>
        acc + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0)

      const session = await saveSession({
        plan_id: activePlan.id,
        date: new Date().toISOString().split('T')[0],
        day_label: currentDay.day_label,
        week_number: activePlan.current_week,
        duration_minutes: Math.round(elapsed / 60),
        exercises,
      })

      setTimerRunning(false)
      setElapsed(0)
      setExerciseSets({})

      toast.success('Sesión guardada correctamente')

      analyze(profile, activePlan).catch(() => {})
    } catch (err) {
      toast.error('Error guardando sesión: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={40} />
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>📋</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '8px' }}>
          Sin plan activo
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Completa el onboarding para generar tu programa personalizado
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
              Semana {activePlan.current_week} · {weekData?.is_deload ? 'DELOAD' : weekData?.theme?.split('—')[0]}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700' }}>
              {currentDay?.day_label || 'Sin sesión hoy'}
            </h1>
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
            }}
          >
            {useKg ? 'KG' : 'LBS'}
          </button>
        </div>
      </div>

      {allDays.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
          {allDays.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDayIdx(i)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${dayIdx === i ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: dayIdx === i ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                color: dayIdx === i ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {day.day_label?.split('–')[0]?.trim() || `Día ${i + 1}`}
            </button>
          ))}
        </div>
      )}

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
                minHeight: '44px',
                padding: '0 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: timerRunning ? 'var(--color-surface-hover)' : 'var(--color-accent)',
                color: timerRunning ? 'var(--color-text)' : '#0d1117',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              {timerRunning ? 'PAUSAR' : elapsed === 0 ? 'INICIAR' : 'REANUDAR'}
            </button>
            {elapsed > 0 && !timerRunning && (
              <button
                onClick={() => setElapsed(0)}
                style={{
                  minHeight: '44px',
                  width: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                ↺
              </button>
            )}
          </div>
        </div>
      </Card>

      {currentDay?.exercises?.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          useKg={useKg}
          onSetsUpdate={handleSetsUpdate}
        />
      ))}

      {currentDay && (
        <div style={{ marginTop: '8px' }}>
          <Button
            onClick={handleFinishSession}
            loading={saving}
            variant="secondary"
          >
            ✅ Finalizar sesión
          </Button>
        </div>
      )}
    </div>
  )
}
