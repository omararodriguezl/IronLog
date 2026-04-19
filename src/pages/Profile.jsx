import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { generateWorkoutPlan } from '../lib/claude'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

export default function Profile() {
  const { profile, signOut, updateProfile, user } = useAuth()
  const { activePlan, savePlan, loading: planLoading } = useWorkout(profile?.id)
  const toast = useToast()

  const [editing, setEditing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [form, setForm] = useState({
    name: profile?.name || '',
    goal: profile?.goal || '',
    days_per_week: profile?.days_per_week || 4,
    level: profile?.level || '',
    equipment: profile?.equipment || '',
    injuries: profile?.injuries || '',
  })

  async function handleSave() {
    try {
      await updateProfile(form)
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

  async function handleSignOut() {
    await signOut()
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Nombre"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Tu nombre"
            />
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
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

      <Card style={{ marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          App
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '16px' }}>
          IRON LOG v1.0.0 · Powered by Claude AI
        </p>
        <Button variant="danger" onClick={handleSignOut}>
          Cerrar sesión
        </Button>
      </Card>
    </div>
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
