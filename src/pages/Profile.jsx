import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { generateWorkoutPlan } from '../lib/claude'
import Spinner from '../components/ui/Spinner'

const goals = [
  { id: 'volume', label: 'Ganar músculo / Volumen' },
  { id: 'strength', label: 'Fuerza pura' },
  { id: 'cut', label: 'Perder grasa / Definición' },
  { id: 'maintenance', label: 'Mantenimiento' },
]

const levels = [
  { id: 'beginner', label: 'Principiante (< 1 año)' },
  { id: 'intermediate', label: 'Intermedio (1-3 años)' },
  { id: 'advanced', label: 'Avanzado (3+ años)' },
]

const equipmentOptions = [
  { id: 'full_gym', label: 'Gimnasio completo' },
  { id: 'dumbbells_bar', label: 'Mancuernas + barra' },
  { id: 'dumbbells', label: 'Solo mancuernas' },
  { id: 'bodyweight', label: 'Peso corporal' },
]

export default function Profile() {
  const { profile, signOut, updateProfile, user } = useAuth()
  const { activePlan, savePlan } = useWorkout(profile?.id)
  const toast = useToast()

  const [editing, setEditing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    goal: '',
    days_per_week: 4,
    level: '',
    equipment: '',
    injuries: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        goal: profile.goal || '',
        days_per_week: profile.days_per_week || 4,
        level: profile.level || '',
        equipment: profile.equipment || '',
        injuries: profile.injuries || '',
      })
    }
  }, [profile])

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    try {
      const updates = { name: form.name }
      if (form.goal) updates.goal = form.goal
      if (form.days_per_week) updates.days_per_week = Number(form.days_per_week)
      if (form.level) updates.level = form.level
      if (form.equipment) updates.equipment = form.equipment
      updates.injuries = form.injuries || null
      await updateProfile(updates)
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handleRegeneratePlan() {
    if (!profile) return
    setRegenerating(true)
    try {
      const planJson = await generateWorkoutPlan({
        goal: profile.goal,
        days: profile.days_per_week,
        level: profile.level,
        equipment: profile.equipment,
        injuries: profile.injuries,
      })
      await savePlan(planJson)
      toast.success('Nuevo plan generado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
          Perfil
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '2px' }}>
          {user?.email}
        </p>
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Mis datos
          </h2>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            style={{
              padding: '6px 14px',
              background: editing ? 'var(--color-accent)' : 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: editing ? '#0d1117' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            {editing ? 'GUARDAR' : 'EDITAR'}
          </button>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nombre"
              value={form.name}
              onChange={e => setF('name', e.target.value)}
              placeholder="Tu nombre"
            />

            <div>
              <label style={labelStyle}>Objetivo</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {goals.map(g => (
                  <OptionPill
                    key={g.id}
                    label={g.label}
                    selected={form.goal === g.id}
                    onClick={() => setF('goal', g.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Días por semana</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[3, 4, 5, 6].map(d => (
                  <button
                    key={d}
                    onClick={() => setF('days_per_week', d)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${form.days_per_week === d ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: form.days_per_week === d ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                      color: form.days_per_week === d ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nivel</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {levels.map(l => (
                  <OptionPill
                    key={l.id}
                    label={l.label}
                    selected={form.level === l.id}
                    onClick={() => setF('level', l.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Equipamiento</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {equipmentOptions.map(e => (
                  <OptionPill
                    key={e.id}
                    label={e.label}
                    selected={form.equipment === e.id}
                    onClick={() => setF('equipment', e.id)}
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Lesiones o limitaciones (opcional)"
              placeholder="Ej: dolor en rodilla derecha..."
              value={form.injuries}
              onChange={e => setF('injuries', e.target.value)}
              style={{ minHeight: '72px' }}
            />

            <Button variant="ghost" onClick={() => { setEditing(false); }}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ProfileRow label="Nombre" value={profile?.name || 'Sin nombre'} />
            <ProfileRow label="Objetivo" value={goalLabel(profile?.goal)} />
            <ProfileRow label="Días/semana" value={profile?.days_per_week ? `${profile.days_per_week} días` : '—'} />
            <ProfileRow label="Nivel" value={levelLabel(profile?.level)} />
            <ProfileRow label="Equipamiento" value={equipLabel(profile?.equipment)} />
            {profile?.injuries && (
              <ProfileRow label="Limitaciones" value={profile.injuries} />
            )}
          </div>
        )}
      </Card>

      {activePlan && (
        <Card style={{ marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Plan activo
          </h2>
          <ProfileRow label="Estructura" value={activePlan.plan_json?.weekly_structure || '—'} />
          <ProfileRow label="Semana actual" value={`${activePlan.current_week} de ${activePlan.plan_json?.total_weeks}`} />
          <ProfileRow label="Inicio" value={activePlan.start_date ? new Date(activePlan.start_date + 'T00:00:00').toLocaleDateString('es') : '—'} />
          {activePlan.plan_json?.coach_rationale && (
            <div style={{
              marginTop: '4px',
              padding: '10px 12px',
              background: 'var(--color-accent-dim)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-accent)',
            }}>
              <p style={{ fontSize: '11px', fontFamily: 'var(--font-display)', color: 'var(--color-accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Razonamiento del Coach
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text)', lineHeight: '1.5' }}>
                {activePlan.plan_json.coach_rationale}
              </p>
            </div>
          )}
          <div style={{ marginTop: '16px' }}>
            <Button
              variant="secondary"
              onClick={handleRegeneratePlan}
              loading={regenerating}
            >
              🔄 Regenerar plan con IA
            </Button>
          </div>
        </Card>
      )}

      {!activePlan && profile?.goal && (
        <Card style={{ marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Generar plan
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            No tienes un plan activo. Genera uno con tu perfil actual.
          </p>
          <Button onClick={handleRegeneratePlan} loading={regenerating}>
            🚀 Generar mi plan con IA
          </Button>
        </Card>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          App
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '16px' }}>
          IRON LOG v1.0.0 · Powered by Claude AI
        </p>
        <Button variant="danger" onClick={signOut}>
          Cerrar sesión
        </Button>
      </Card>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: '8px',
}

function OptionPill({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
        background: selected ? 'var(--color-accent-dim)' : 'var(--color-surface)',
        color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {label}
      {selected && <span style={{ fontSize: '16px' }}>✓</span>}
    </button>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-dim)', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: 'var(--color-text)', textAlign: 'right' }}>
        {value || '—'}
      </span>
    </div>
  )
}

function goalLabel(goal) {
  const m = { volume: 'Ganar músculo / Volumen', strength: 'Fuerza pura', cut: 'Perder grasa / Definición', maintenance: 'Mantenimiento' }
  return m[goal] || goal || '—'
}

function levelLabel(level) {
  const m = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' }
  return m[level] || level || '—'
}

function equipLabel(equip) {
  const m = { full_gym: 'Gimnasio completo', dumbbells_bar: 'Mancuernas + barra', dumbbells: 'Solo mancuernas', bodyweight: 'Peso corporal' }
  return m[equip] || equip || '—'
}
