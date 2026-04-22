import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import { useCoach } from '../hooks/useCoach'
import ExerciseCard from '../components/workout/ExerciseCard'
import Icon from '../components/ui/Icon'
import { useToast } from '../components/ui/Toast'

export default function Workout() {
  const { profile } = useAuth()
  const { activePlan, sessions, saveSession, deleteSession, deleteAllSessions, updateCurrentWeek, swapExercise, getCurrentWeekData, loading } = useWorkout(profile?.id)
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
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const intervalRef = useRef(null)

  const weekData = getCurrentWeekData()
  const allDays = activePlan?.plan_json?.days || weekData?.days || []

  const today = new Date().toISOString().split('T')[0]

  const completedDayLabels = new Set(
    sessions
      .filter(s => s.week_number === activePlan?.current_week)
      .map(s => s.day_label)
  )

  const defaultDayIdx = (() => {
    const firstIncomplete = allDays.findIndex(d => !completedDayLabels.has(d.day_label))
    return firstIncomplete >= 0 ? firstIncomplete : 0
  })()
  const dayIdx = selectedDayIdx ?? defaultDayIdx
  const currentDay = allDays[dayIdx] || null

  const todaySessionDone = sessions.some(
    s => s.date === today && s.day_label === currentDay?.day_label
  )

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

      const newCompleted = new Set([...completedDayLabels, currentDay.day_label])
      const allDone = allDays.every(d => newCompleted.has(d.day_label))

      if (allDone) {
        const nextWeek = activePlan.current_week + 1
        if (nextWeek <= (activePlan.plan_json?.total_weeks || 0)) {
          await updateCurrentWeek(activePlan.id, nextWeek)
          setSelectedDayIdx(0)
          toast.success(`¡Semana ${activePlan.current_week} completada! 🎉 Avanzando a semana ${nextWeek}`)
        } else {
          toast.success('¡Plan completado! 🏆 Has terminado todo el programa')
        }
      } else {
        const nextIdx = allDays.findIndex((d, i) => i > dayIdx && !newCompleted.has(d.day_label))
        if (nextIdx >= 0) setSelectedDayIdx(nextIdx)
        toast.success('¡Sesión guardada! 💪')
      }

      analyze(profile, activePlan).catch(() => {})
    } catch (err) {
      toast.error('Error guardando sesión: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSession(id) {
    try {
      await deleteSession(id)
      setExpandedSession(null)
      toast.success('Sesión eliminada')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handleDeleteAllHistory() {
    try {
      await deleteAllSessions()
      setConfirmDeleteAll(false)
      setShowHistory(false)
      toast.success('Historial eliminado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--line)', borderTopColor: 'var(--acc)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!activePlan) {
    return (
      <div className="iron-in" style={{ padding: '0 20px', paddingTop: 'calc(var(--safe-top) + 60px)', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Sin plan activo</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Configura tu perfil para generar tu programa</div>
      </div>
    )
  }

  return (
    <div className="iron-in" style={{ padding: '0 20px 32px', paddingTop: 'calc(var(--safe-top) + 60px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="eyebrow">
            Semana {activePlan.current_week}/{activePlan.plan_json?.total_weeks}
            {weekData?.is_deload ? ' · DELOAD' : weekData?.theme ? ` · ${weekData.theme}` : ''}
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.2 }}>
            {currentDay?.day_label?.split('–')[0]?.trim() || 'Sin sesión'}
            {currentDay?.day_label?.includes('–') && (
              <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, fontSize: 20 }}>
                {currentDay.day_label.split('–')[1]?.trim()}
              </div>
            )}
          </div>
          {weekComplete && (
            <span style={{ display: 'inline-flex', marginTop: 6, padding: '3px 10px', borderRadius: 999, background: 'var(--acc-soft)', border: '1px solid color-mix(in oklch, var(--acc) 30%, transparent)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--acc)' }}>
              SEMANA COMPLETA
            </span>
          )}
        </div>
        <button
          onClick={() => setUseKg(k => !k)}
          style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg-2)', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer', flexShrink: 0, marginTop: 4 }}
        >
          {useKg ? 'KG' : 'LBS'}
        </button>
      </div>

      {/* Week progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="eyebrow">Progreso semana</span>
          <span className="mono tabular" style={{ fontSize: 11, color: 'var(--acc)' }}>{weekDaysDone}/{weekDaysTotal}</span>
        </div>
        <div className="bar">
          <span style={{ display: 'block', height: '100%', width: weekDaysTotal > 0 ? `${(weekDaysDone / weekDaysTotal) * 100}%` : '0%', borderRadius: 2, transition: 'width .4s ease' }} />
        </div>
      </div>

      {/* Day selector */}
      {allDays.length > 1 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
          {allDays.map((day, i) => {
            const done = completedDayLabels.has(day.day_label)
            const active = dayIdx === i
            return (
              <button
                key={i}
                onClick={() => setSelectedDayIdx(i)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: `1px solid ${active ? 'color-mix(in oklch, var(--acc) 40%, transparent)' : done ? 'color-mix(in oklch, var(--acc) 20%, transparent)' : 'var(--line)'}`,
                  background: active ? 'var(--acc-soft)' : done ? 'color-mix(in oklch, var(--acc) 8%, transparent)' : 'var(--bg-1)',
                  color: active ? 'var(--acc)' : done ? 'color-mix(in oklch, var(--acc) 70%, var(--ink))' : 'var(--ink-3)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {done && !active ? '✓ ' : ''}{day.day_label?.split('–')[0]?.trim() || `Día ${i + 1}`}
              </button>
            )
          })}
        </div>
      )}

      {/* Timer card */}
      <div className="card" style={{ marginBottom: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow">Tiempo de sesión</div>
            <div className="mono tabular" style={{ fontSize: 40, fontWeight: 600, marginTop: 4, letterSpacing: -1, lineHeight: 1 }}>
              {formatTime(elapsed)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {elapsed > 0 && !timerRunning && (
              <button
                onClick={() => setElapsed(0)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--bg-2)', color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="refresh" size={16} />
              </button>
            )}
            <button
              onClick={() => setTimerRunning(r => !r)}
              style={{ width: 56, height: 56, borderRadius: '50%', border: 0, background: timerRunning ? 'var(--bg-3)' : 'var(--acc)', color: timerRunning ? 'var(--ink)' : 'var(--acc-ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Icon name={timerRunning ? 'pause' : 'play'} size={22} color="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Already done banner */}
      {todaySessionDone && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--acc-soft)', border: '1px solid color-mix(in oklch, var(--acc) 25%, transparent)', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="check" size={16} color="var(--acc)" stroke={2} />
          <span style={{ fontSize: 13, color: 'var(--acc)', fontWeight: 500 }}>Ya completaste esta sesión hoy</span>
        </div>
      )}

      {/* AI progression note */}
      {weekData?.progression_note && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--acc-soft)', border: '1px solid color-mix(in oklch, var(--acc) 25%, transparent)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="sparkle" size={16} color="var(--acc)" stroke={2} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>{weekData.progression_note}</div>
        </div>
      )}

      {/* Exercises */}
      {currentDay?.exercises?.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          useKg={useKg}
          onSetsUpdate={handleSetsUpdate}
          profile={profile}
          onSwap={newEx => swapExercise(activePlan.id, currentDay.day_label, exercise.id, newEx).catch(err => toast.error('Error: ' + err.message))}
        />
      ))}

      {/* Finish button */}
      {currentDay && (
        <div style={{ marginTop: 8, marginBottom: 32 }}>
          <button
            onClick={handleFinishSession}
            disabled={saving}
            style={{
              width: '100%', height: 54, borderRadius: 16,
              background: todaySessionDone ? 'var(--bg-2)' : 'var(--acc)',
              color: todaySessionDone ? 'var(--ink-3)' : 'var(--acc-ink)',
              border: todaySessionDone ? '1px solid var(--line)' : 0,
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
              cursor: saving ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'currentColor', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>
                <Icon name={todaySessionDone ? 'refresh' : 'check'} size={18} color="currentColor" stroke={2} />
                {todaySessionDone ? 'Registrar otra sesión' : 'Finalizar sesión'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Full plan section */}
      <FullPlanSection plan={activePlan} sessions={sessions} />

      {/* Calendar */}
      <SessionCalendar sessions={sessions} />

      {/* History */}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
        <button
          onClick={() => setShowHistory(h => !h)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', marginBottom: showHistory ? 12 : 0 }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
            Historial de entrenos
          </span>
          <Icon name={showHistory ? 'chevronU' : 'chevronD'} size={18} color="var(--ink-3)" />
        </button>

        {showHistory && (
          <div style={{ animation: 'fadeIn .2s ease' }}>
            {sessions.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {!confirmDeleteAll ? (
                  <button
                    onClick={() => setConfirmDeleteAll(true)}
                    style={{ fontSize: 12, color: '#e05454', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Icon name="trash" size={13} color="#e05454" />
                    Borrar todo el historial
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(224,84,84,0.08)', borderRadius: 10, border: '1px solid rgba(224,84,84,0.2)' }}>
                    <span style={{ fontSize: 12, color: '#e05454', flex: 1 }}>¿Borrar todas las sesiones?</span>
                    <button onClick={handleDeleteAllHistory} style={{ fontSize: 12, color: '#e05454', background: 'none', border: '1px solid #e05454', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>SÍ</button>
                    <button onClick={() => setConfirmDeleteAll(false)} style={{ fontSize: 12, color: 'var(--ink-3)', background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>NO</button>
                  </div>
                )}
              </div>
            )}

            {sessions.length === 0 ? (
              <div style={{ color: 'var(--ink-4)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                Sin sesiones registradas aún
              </div>
            ) : (
              sessions.map(session => (
                <SessionHistoryCard
                  key={session.id}
                  session={session}
                  expanded={expandedSession === session.id}
                  onToggle={() => setExpandedSession(id => id === session.id ? null : session.id)}
                  onDelete={() => handleDeleteSession(session.id)}
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

function SessionCalendar({ sessions }) {
  const [monthOffset, setMonthOffset] = useState(0)

  const now = new Date()
  const displayDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()

  const monthLabel = displayDate.toLocaleDateString('es', { month: 'long', year: 'numeric' })

  const sessionDates = new Set(
    sessions
      .filter(s => {
        const d = new Date(s.date + 'T00:00:00')
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map(s => s.date)
  )

  const firstDow = new Date(year, month, 1).getDay()
  const startOffset = firstDow === 0 ? 6 : firstDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  if (!sessions.length && monthOffset === 0) return null

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
          Calendario
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setMonthOffset(o => o - 1)} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 6, width: 28, height: 28, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronL" size={14} />
          </button>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'capitalize', minWidth: 110, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 6, width: 28, height: 28, color: monthOffset >= 0 ? 'var(--ink-4)' : 'var(--ink-3)', cursor: monthOffset >= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronR" size={14} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-4)', letterSpacing: '0.08em' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasSession = sessionDates.has(dateStr)
          const isToday = dateStr === todayStr
          return (
            <div key={dateStr} style={{
              aspectRatio: '1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6,
              background: hasSession ? 'var(--acc)' : isToday ? 'var(--bg-3)' : 'transparent',
              border: isToday && !hasSession ? '1px solid var(--line-strong)' : 'none',
            }}>
              <span className="mono tabular" style={{ fontSize: 11, fontWeight: hasSession ? 600 : 400, color: hasSession ? 'var(--acc-ink)' : isToday ? 'var(--acc)' : 'var(--ink-3)' }}>
                {day}
              </span>
            </div>
          )
        })}
      </div>

      {sessionDates.size > 0 && (
        <div className="eyebrow" style={{ marginTop: 8, textAlign: 'right' }}>
          {sessionDates.size} entreno{sessionDates.size !== 1 ? 's' : ''} este mes
        </div>
      )}
    </div>
  )
}

function FullPlanSection({ plan, sessions }) {
  const [open, setOpen] = useState(false)
  const [openWeek, setOpenWeek] = useState(null)

  if (!plan?.plan_json?.weeks) return null

  const weeks = plan.plan_json.weeks
  const days = plan.plan_json.days || []

  const completedWeeks = new Set(sessions.map(s => s.week_number))

  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginBottom: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', marginBottom: open ? 14 : 0 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>
          Plan completo
        </span>
        <Icon name={open ? 'chevronU' : 'chevronD'} size={18} color="var(--ink-3)" />
      </button>

      {open && (
        <div style={{ animation: 'fadeIn .2s ease' }}>
          {weeks.map(week => {
            const isCurrentWeek = week.week_number === plan.current_week
            const isDone = completedWeeks.has(week.week_number) && !isCurrentWeek
            const isExpanded = openWeek === week.week_number

            return (
              <div key={week.week_number} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => setOpenWeek(w => w === week.week_number ? null : week.week_number)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: isCurrentWeek ? 'var(--acc-soft)' : 'var(--bg-1)',
                    border: `1px solid ${isCurrentWeek ? 'color-mix(in oklch, var(--acc) 30%, transparent)' : 'var(--line)'}`,
                    borderRadius: isExpanded ? '10px 10px 0 0' : 10,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', color: isCurrentWeek ? 'var(--acc)' : isDone ? 'var(--ink-4)' : 'var(--ink-2)' }}>
                        {isDone ? '✓ ' : ''}{isCurrentWeek ? '▶ ' : ''}SEMANA {week.week_number}
                      </span>
                      {week.is_deload && (
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: '#d29922', background: 'rgba(210,153,34,0.12)', padding: '2px 6px', borderRadius: 999, border: '1px solid rgba(210,153,34,0.3)' }}>DELOAD</span>
                      )}
                      {isCurrentWeek && (
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--acc)', background: 'var(--acc-soft)', padding: '2px 6px', borderRadius: 999, border: '1px solid color-mix(in oklch, var(--acc) 30%, transparent)' }}>ACTUAL</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{week.theme}</div>
                  </div>
                  <Icon name={isExpanded ? 'chevronU' : 'chevronD'} size={16} color="var(--ink-4)" />
                </button>

                {isExpanded && (
                  <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 14px' }}>
                    {week.progression_note && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-start' }}>
                        <Icon name="sparkle" size={14} color="var(--acc)" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>{week.progression_note}</div>
                      </div>
                    )}
                    {days.map((day, di) => (
                      <div key={di} style={{ marginBottom: 12 }}>
                        <div className="eyebrow" style={{ marginBottom: 6 }}>{day.day_label}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {(day.exercises || []).map((ex, ei) => (
                            <div key={ei} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-2)', borderRadius: 7 }}>
                              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{ex.name}</span>
                              <span className="mono tabular" style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 8 }}>{ex.sets}×{ex.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SessionHistoryCard({ session, expanded, onToggle, onDelete, useKg }) {
  const totalVolume = (session.exercises || []).reduce((acc, ex) =>
    acc + (ex.sets || []).reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0)
  const totalSets = (session.exercises || []).reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)

  return (
    <div className="card" style={{ marginBottom: 8, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--acc)', background: 'var(--acc-soft)', padding: '2px 8px', borderRadius: 999 }}>
              SEM {session.week_number}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{session.day_label}</div>
          <div className="eyebrow" style={{ marginTop: 3 }}>
            {new Date(session.date + 'T00:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
            {session.duration_minutes > 0 && ` · ${session.duration_minutes} min`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: '2px 0 2px 8px', display: 'flex' }}
          >
            <Icon name="trash" size={15} color="var(--ink-4)" />
          </button>
          {totalVolume > 0 && (
            <>
              <div className="mono tabular" style={{ fontSize: 16, fontWeight: 500 }}>
                {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}${useKg ? 'kg' : 'lbs'}`}
              </div>
              <div className="eyebrow">volumen</div>
            </>
          )}
          {totalSets > 0 && <div className="eyebrow">{totalSets} series</div>}
        </div>
      </div>

      {expanded && (session.exercises || []).length > 0 && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          {session.exercises.map((ex, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 5 }}>{ex.name}</div>
              {(ex.sets || []).length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ex.sets.map((set, j) => (
                    <span key={j} className="mono tabular" style={{ padding: '3px 10px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 999, fontSize: 11, color: 'var(--ink-3)' }}>
                      {set.reps} × {set.weight}{useKg ? 'kg' : 'lbs'}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sin sets registrados</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
