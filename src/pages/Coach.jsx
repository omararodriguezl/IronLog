import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import { useCoach } from '../hooks/useCoach'
import CoachMessage from '../components/coach/CoachMessage'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useToast } from '../components/ui/Toast'

export default function Coach() {
  const { profile } = useAuth()
  const { activePlan } = useWorkout(profile?.id)
  const { analysis, loading, error, lastAnalyzed, analyze } = useCoach(profile?.id)
  const toast = useToast()

  async function handleAnalyze() {
    if (!profile) { toast.error('Perfil no cargado'); return }
    try {
      await analyze(profile, activePlan)
      toast.success('Análisis completado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  return (
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
          Coach IA
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '2px' }}>
          Análisis personalizado por Claude
        </p>
      </div>

      {activePlan && (
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Stat label="Objetivo" value={goalLabel(profile?.goal)} />
            <Stat label="Semana" value={`${activePlan.current_week}/${activePlan.plan_json?.total_weeks}`} />
            <Stat label="Nivel" value={levelLabel(profile?.level)} />
          </div>
        </Card>
      )}

      <Button
        onClick={handleAnalyze}
        loading={loading}
        style={{ marginBottom: '20px' }}
      >
        🧠 Analizar mi progreso
      </Button>

      {error && (
        <Card style={{ borderLeft: '3px solid var(--color-danger)', marginBottom: '16px' }}>
          <p style={{ color: 'var(--color-danger)', fontSize: '14px' }}>⚠️ {error}</p>
        </Card>
      )}

      {!analysis && !loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-dim)' }}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🏋️</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '6px' }}>
            Sin análisis todavía
          </p>
          <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
            Entrena y registra tus sesiones para obtener recomendaciones personalizadas de tu Coach IA
          </p>
        </div>
      )}

      {analysis && (
        <CoachMessage analysis={analysis} lastAnalyzed={lastAnalyzed} />
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--color-text)' }}>
        {value || '—'}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>
        {label}
      </p>
    </div>
  )
}

function goalLabel(goal) {
  const m = { volume: 'Volumen', strength: 'Fuerza', cut: 'Definición', maintenance: 'Mantto.' }
  return m[goal] || goal || '—'
}

function levelLabel(level) {
  const m = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' }
  return m[level] || level || '—'
}
