import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Textarea } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { generateWorkoutPlan } from '../lib/claude'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

const TOTAL_STEPS = 4

const goals = [
  { id: 'volume', icon: '💪', title: 'Ganar músculo / Volumen', desc: 'Maximizar masa muscular' },
  { id: 'strength', icon: '🏋️', title: 'Fuerza pura', desc: 'Levantar más peso' },
  { id: 'cut', icon: '🔥', title: 'Perder grasa / Definición', desc: 'Reducir grasa corporal' },
  { id: 'maintenance', icon: '⚖️', title: 'Mantenimiento', desc: 'Mantener forma actual' },
]

const daysOptions = [3, 4, 5, 6]

const levels = [
  { id: 'beginner', icon: '🌱', title: 'Principiante', desc: 'Menos de 1 año entrenando' },
  { id: 'intermediate', icon: '🌿', title: 'Intermedio', desc: '1 a 3 años entrenando' },
  { id: 'advanced', icon: '🌳', title: 'Avanzado', desc: 'Más de 3 años entrenando' },
]

const equipmentOptions = [
  { id: 'full_gym', icon: '🏢', title: 'Gimnasio completo', desc: 'Máquinas, barras, mancuernas' },
  { id: 'dumbbells_bar', icon: '🏗️', title: 'Mancuernas + barra', desc: 'Sin máquinas' },
  { id: 'dumbbells', icon: '🏋️', title: 'Solo mancuernas', desc: 'Sin barras ni máquinas' },
  { id: 'bodyweight', icon: '🤸', title: 'Peso corporal', desc: 'Sin equipamiento' },
]

export default function Onboarding({ onComplete }) {
  const { user, updateProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    goal: '',
    days_per_week: 4,
    injuries: '',
    level: '',
    equipment: '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleFinish() {
    setGenerating(true)
    try {
      const profile = await updateProfile({
        name: user.email.split('@')[0],
        goal: form.goal,
        days_per_week: form.days_per_week,
        injuries: form.injuries,
        level: form.level,
        equipment: form.equipment,
      })

      const planJson = await generateWorkoutPlan({
        goal: form.goal,
        days: form.days_per_week,
        level: form.level,
        equipment: form.equipment,
        injuries: form.injuries,
      })

      const { data, error } = await supabase.from('workout_plans').insert({
          user_id: user.id,
          plan_json: planJson,
          goal: planJson.goal,
          total_weeks: planJson.total_weeks,
          current_week: 1,
          start_date: new Date().toISOString().split('T')[0],
        }).select().single()
      if (error) throw error

      onComplete()
    } catch (err) {
      console.error(err)
      alert('Error generando el plan: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
        background: 'var(--color-bg)',
      }}>
        <Spinner size={56} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '8px' }}>
            Generando tu plan
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Claude está creando tu programa personalizado…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      paddingTop: 'var(--safe-top)',
      paddingBottom: 'calc(var(--safe-bottom) + 24px)',
    }}>
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-accent)' }}>
            IRON LOG
          </h1>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {step} / {TOTAL_STEPS}
          </span>
        </div>
        <div style={{ height: '3px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(step / TOTAL_STEPS) * 100}%`,
            background: 'var(--color-accent)',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto' }}>
        {step === 1 && (
          <Step
            title="¿Cuál es tu objetivo?"
            subtitle="Esto determina la estructura de tu programa"
          >
            {goals.map(g => (
              <OptionCard
                key={g.id}
                icon={g.icon}
                title={g.title}
                desc={g.desc}
                selected={form.goal === g.id}
                onClick={() => set('goal', g.id)}
              />
            ))}
          </Step>
        )}

        {step === 2 && (
          <Step
            title="¿Cuántos días entrenas?"
            subtitle="Elige los días disponibles por semana"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
              {daysOptions.map(d => (
                <button
                  key={d}
                  onClick={() => set('days_per_week', d)}
                  style={{
                    minHeight: '72px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${form.days_per_week === d ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: form.days_per_week === d ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                    color: form.days_per_week === d ? 'var(--color-accent)' : 'var(--color-text)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d}
                  <span style={{ fontSize: '11px', letterSpacing: '0.04em' }}>días</span>
                </button>
              ))}
            </div>
            <Textarea
              label="Lesiones o limitaciones físicas (opcional)"
              placeholder="Ej: Dolor en rodilla derecha, evitar sentadillas profundas…"
              value={form.injuries}
              onChange={e => set('injuries', e.target.value)}
              style={{ minHeight: '80px' }}
            />
          </Step>
        )}

        {step === 3 && (
          <Step
            title="¿Cuál es tu nivel?"
            subtitle="Sé honesto para obtener el mejor programa"
          >
            {levels.map(l => (
              <OptionCard
                key={l.id}
                icon={l.icon}
                title={l.title}
                desc={l.desc}
                selected={form.level === l.id}
                onClick={() => set('level', l.id)}
              />
            ))}
          </Step>
        )}

        {step === 4 && (
          <Step
            title="¿Qué equipamiento tienes?"
            subtitle="Adaptaremos los ejercicios a lo disponible"
          >
            {equipmentOptions.map(e => (
              <OptionCard
                key={e.id}
                icon={e.icon}
                title={e.title}
                desc={e.desc}
                selected={form.equipment === e.id}
                onClick={() => set('equipment', e.id)}
              />
            ))}
          </Step>
        )}
      </div>

      <div style={{ padding: '0 20px', display: 'flex', gap: '10px' }}>
        {step > 1 && (
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} style={{ flex: '0 0 auto', width: '52px' }}>
            ←
          </Button>
        )}
        <Button
          onClick={() => {
            if (step < TOTAL_STEPS) setStep(s => s + 1)
            else handleFinish()
          }}
          disabled={
            (step === 1 && !form.goal) ||
            (step === 3 && !form.level) ||
            (step === 4 && !form.equipment)
          }
        >
          {step === TOTAL_STEPS ? '🚀 Generar mi plan' : 'Continuar →'}
        </Button>
      </div>
    </div>
  )
}

function Step({ title, subtitle, children }) {
  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        {subtitle}
      </p>
      {children}
    </div>
  )
}

function OptionCard({ icon, title, desc, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
        background: selected ? 'var(--color-accent-dim)' : 'var(--color-surface)',
        cursor: 'pointer',
        marginBottom: '10px',
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: '600',
          color: selected ? 'var(--color-accent)' : 'var(--color-text)',
        }}>
          {title}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{desc}</p>
      </div>
      {selected && <span style={{ color: 'var(--color-accent)', fontSize: '18px' }}>✓</span>}
    </div>
  )
}
