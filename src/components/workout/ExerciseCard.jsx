import React, { useState } from 'react'
import Card from '../ui/Card'
import SetLogger from './SetLogger'
import RestTimer from './RestTimer'
import GifModal from './GifModal'
import ExerciseSwapSheet from './ExerciseSwapSheet'
import Icon from '../ui/Icon'
import { muscleGroupColors } from '../../theme'

export default function ExerciseCard({ exercise, useKg, onSetsUpdate, onSwap, profile }) {
  const [loggedSets, setLoggedSets] = useState([])
  const [showTimer, setShowTimer] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [showSwap, setShowSwap] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const muscleColor = muscleGroupColors[exercise.muscle_group] || 'var(--color-text-muted)'

  function handleLog(set) {
    const newSets = [...loggedSets, set]
    setLoggedSets(newSets)
    onSetsUpdate?.(exercise.id, newSets)
    setShowTimer(true)
  }

  function removeSet(idx) {
    const newSets = loggedSets.filter((_, i) => i !== idx)
    setLoggedSets(newSets)
    onSetsUpdate?.(exercise.id, newSets)
  }

  const setsComplete = loggedSets.length >= exercise.sets

  return (
    <>
      <Card style={{
        borderLeft: `3px solid ${muscleColor}`,
        marginBottom: '12px',
        transition: 'all 0.2s ease',
        ...(setsComplete ? { opacity: 0.7, borderLeftColor: 'var(--color-accent)' } : {}),
      }}>
        <div
          onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: '700',
                color: setsComplete ? 'var(--color-accent)' : 'var(--color-text)',
              }}>
                {setsComplete && '✓ '}{exercise.name}
              </h3>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-display)',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: `${muscleColor}22`,
                color: muscleColor,
                letterSpacing: '0.04em',
              }}>
                {exercise.muscle_group}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              {exercise.sets} series × {exercise.reps} reps · {exercise.rest_seconds}s descanso
            </p>
            {exercise.tip && (
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-dim)',
                fontFamily: 'var(--font-body)',
                marginTop: '4px',
                fontStyle: 'italic',
              }}>
                💡 {exercise.tip}
              </p>
            )}
            {onSwap && (
              <button
                onClick={e => { e.stopPropagation(); setShowSwap(true) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 8, padding: '4px 10px',
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 999,
                  fontFamily: 'var(--font-display)', fontSize: 11,
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer', letterSpacing: '0.04em',
                }}
              >
                <Icon name="refresh" size={11} color="currentColor" />
                Cambiar ejercicio
              </button>
            )}
          </div>

          {/* Video button */}
          <button
            onClick={e => { e.stopPropagation(); setShowGif(true) }}
            style={{
              width: 36, height: 36, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '16px',
              cursor: 'pointer',
            }}
            title="Ver tutorial"
          >
            🎬
          </button>
        </div>

        {expanded && (
          <div style={{ marginTop: '16px' }}>
            {loggedSets.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {loggedSets.map((set, i) => (
                  <div
                    key={i}
                    onClick={() => removeSet(i)}
                    style={{
                      padding: '4px 10px',
                      background: 'var(--color-accent-dim)',
                      border: '1px solid var(--color-accent)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-accent)',
                      cursor: 'pointer',
                    }}
                    title="Toca para eliminar"
                  >
                    S{i + 1}: {set.reps}×{set.weight}{set.unit}
                  </div>
                ))}
              </div>
            )}

            {!setsComplete && (
              <SetLogger
                setNumber={loggedSets.length + 1}
                prescribedReps={exercise.reps}
                onLog={handleLog}
                useKg={useKg}
              />
            )}

            {showTimer && (
              <div style={{ marginTop: '12px' }}>
                <RestTimer
                  seconds={exercise.rest_seconds || 90}
                  autoStart={true}
                  onComplete={() => setShowTimer(false)}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <GifModal
        exercise={showGif ? exercise : null}
        onClose={() => setShowGif(false)}
      />

      {showSwap && (
        <ExerciseSwapSheet
          exercise={exercise}
          profile={profile}
          onSwap={onSwap}
          onClose={() => setShowSwap(false)}
        />
      )}
    </>
  )
}
