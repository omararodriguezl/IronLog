import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useWorkout } from '../hooks/useWorkout'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'
import { generateWorkoutPlan } from '../lib/claude'
import Icon from '../components/ui/Icon'

const goals = [
  { id: 'volume',      label: 'Ganar músculo / Volumen' },
  { id: 'strength',    label: 'Fuerza pura' },
  { id: 'cut',         label: 'Perder grasa / Definición' },
  { id: 'maintenance', label: 'Mantenimiento' },
]
const levels = [
  { id: 'beginner',     label: 'Principiante (< 1 año)' },
  { id: 'intermediate', label: 'Intermedio (1-3 años)' },
  { id: 'advanced',     label: 'Avanzado (3+ años)' },
]
const equipmentOptions = [
  { id: 'full_gym',      label: 'Gimnasio completo' },
  { id: 'dumbbells_bar', label: 'Mancuernas + barra' },
  { id: 'dumbbells',     label: 'Solo mancuernas' },
  { id: 'bodyweight',    label: 'Peso corporal' },
]

export default function Profile() {
  const navigate  = useNavigate()
  const { profile, signOut, updateProfile, user } = useAuth()
  const { activePlan, savePlan } = useWorkout(profile?.id)
  const toast = useToast()

  const [editing, setEditing]         = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [form, setForm] = useState({ name: '', goal: '', days_per_week: 4, level: '', equipment: '', injuries: '' })

  useEffect(() => {
    if (profile) setForm({
      name: profile.name || '',
      goal: profile.goal || '',
      days_per_week: profile.days_per_week || 4,
      level: profile.level || '',
      equipment: profile.equipment || '',
      injuries: profile.injuries || '',
    })
  }, [profile])

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSave(andRegenerate = false) {
    try {
      const updates = { name: form.name }
      if (form.goal)         updates.goal         = form.goal
      if (form.days_per_week) updates.days_per_week = Number(form.days_per_week)
      if (form.level)        updates.level        = form.level
      if (form.equipment)    updates.equipment    = form.equipment
      updates.injuries = form.injuries || null
      await updateProfile(updates)
      setEditing(false)
      if (andRegenerate) await handleRegeneratePlan({ ...profile, ...updates })
      else toast.success('Perfil actualizado')
    } catch (err) { toast.error('Error: ' + err.message) }
  }

  async function handleRegeneratePlan(overrideProfile) {
    const p = overrideProfile || profile
    if (!p) return
    setRegenerating(true)
    try {
      const planJson = await generateWorkoutPlan({ goal: p.goal, days: p.days_per_week, level: p.level, equipment: p.equipment, injuries: p.injuries })
      await savePlan(planJson)
      toast.success('¡Nuevo plan generado! 🚀')
    } catch (err) { toast.error('Error: ' + err.message) }
    finally { setRegenerating(false) }
  }

  const initials = (profile?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="iron-in" style={{ padding: '0 20px 32px', paddingTop: 'calc(var(--safe-top) + 60px)' }}>

      {/* Header */}
      <div className="eyebrow" style={{ marginBottom: 6 }}>Cuenta</div>
      <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.8, marginBottom: 4 }}>Perfil.</div>
      <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 24 }}>{user?.email}</div>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: 'linear-gradient(135deg, var(--acc), var(--acc-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--acc-ink)', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>{profile?.name || 'Sin nombre'}</div>
          <div className="mono" style={{ color: 'var(--ink-3)', fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {levelLabel(profile?.level)}
          </div>
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 999, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--ink-2)', fontSize: 12, fontFamily: 'var(--font-display)', cursor: 'pointer' }}
        >
          <Icon name="edit" size={13} /> Editar
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card" style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nombre" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Tu nombre" />

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Objetivo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {goals.map(g => <OptionRow key={g.id} label={g.label} selected={form.goal === g.id} onClick={() => setF('goal', g.id)} />)}
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Días por semana</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[3, 4, 5, 6].map(d => (
                <button key={d} onClick={() => setF('days_per_week', d)} style={{ padding: '12px 8px', borderRadius: 'var(--r-md)', border: `1px solid ${form.days_per_week === d ? 'var(--acc)' : 'var(--line)'}`, background: form.days_per_week === d ? 'var(--acc-soft)' : 'var(--bg-2)', color: form.days_per_week === d ? 'var(--acc)' : 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, cursor: 'pointer' }}>{d}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Nivel</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {levels.map(l => <OptionRow key={l.id} label={l.label} selected={form.level === l.id} onClick={() => setF('level', l.id)} />)}
            </div>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Equipamiento</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {equipmentOptions.map(e => <OptionRow key={e.id} label={e.label} selected={form.equipment === e.id} onClick={() => setF('equipment', e.id)} />)}
            </div>
          </div>

          <Textarea label="Lesiones / limitaciones" placeholder="Ej: dolor en rodilla..." value={form.injuries} onChange={e => setF('injuries', e.target.value)} style={{ minHeight: '72px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => handleSave(false)} style={{ width: '100%', height: 46, borderRadius: 999, background: 'var(--acc)', color: 'var(--acc-ink)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Guardar cambios
            </button>
            <button onClick={() => handleSave(true)} disabled={regenerating} style={{ width: '100%', height: 46, borderRadius: 999, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--ink-2)', fontFamily: 'var(--font-display)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {regenerating ? <Spinner /> : <><Icon name="refresh" size={14} /> Guardar y regenerar plan</>}
            </button>
            <button onClick={() => setEditing(false)} style={{ width: '100%', height: 38, borderRadius: 999, border: 0, background: 'transparent', color: 'var(--ink-3)', fontFamily: 'var(--font-display)', fontSize: 13, cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Data rows */}
      {!editing && (
        <div style={{ marginBottom: 20, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {[
            ['Objetivo',     goalLabel(profile?.goal)],
            ['Días/semana',  profile?.days_per_week ? `${profile.days_per_week} días` : '—'],
            ['Nivel',        levelLabel(profile?.level)],
            ['Equipamiento', equipLabel(profile?.equipment)],
            ...(profile?.injuries ? [['Limitaciones', profile.injuries]] : []),
          ].map(([k, v], i, arr) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span className="mono" style={{ color: 'var(--ink-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</span>
              <span style={{ fontSize: 14, color: 'var(--ink)', textAlign: 'right', maxWidth: '55%' }}>{v || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Active plan */}
      {activePlan && (
        <div style={{ marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Plan activo</div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{activePlan.plan_json?.weekly_structure || 'Plan IA'}</div>
                <div className="mono tabular" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Semana {activePlan.current_week}/{activePlan.plan_json?.total_weeks} · desde {activePlan.start_date ? new Date(activePlan.start_date + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' }) : '—'}
                </div>
              </div>
              <span className="chip acc">Activo</span>
            </div>

            <div className="bar" style={{ marginTop: 14 }}>
              <span style={{ width: `${Math.round(((activePlan.current_week - 1) / activePlan.plan_json?.total_weeks) * 100)}%` }} />
            </div>

            {activePlan.plan_json?.coach_rationale && (
              <div style={{ marginTop: 14, padding: 14, background: 'var(--acc-soft)', borderRadius: 12, border: '1px solid color-mix(in oklch, var(--acc) 20%, transparent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Icon name="sparkle" size={12} color="var(--acc)" stroke={2} />
                  <span className="eyebrow" style={{ color: 'var(--acc)' }}>Razonamiento del coach</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  {activePlan.plan_json.coach_rationale}
                </div>
              </div>
            )}

            <button onClick={() => handleRegeneratePlan()} disabled={regenerating} style={{ width: '100%', marginTop: 14, height: 42, borderRadius: 999, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--ink-2)', fontFamily: 'var(--font-display)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
              {regenerating ? <Spinner /> : <><Icon name="refresh" size={14} /> Regenerar plan con IA</>}
            </button>
          </div>
        </div>
      )}

      {!activePlan && profile?.goal && (
        <div className="card" style={{ marginBottom: 20, textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>No tienes un plan activo. Genera uno con tu perfil actual.</div>
          <button onClick={() => handleRegeneratePlan()} disabled={regenerating} style={{ padding: '10px 24px', borderRadius: 999, background: 'var(--acc)', color: 'var(--acc-ink)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {regenerating ? <Spinner /> : <><Icon name="sparkle" size={14} stroke={2} /> Generar mi plan</>}
          </button>
        </div>
      )}

      {/* App section */}
      <div style={{ marginBottom: 20, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <button onClick={() => navigate('/coach')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: 0, borderLeft: 0, borderRight: 0, borderBottom: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: 14, cursor: 'pointer' }}>
          <Icon name="sparkle" size={18} color="var(--acc)" stroke={2} />
          <span>Coach IA</span>
          <Icon name="chevronR" size={14} color="var(--ink-3)" style={{ marginLeft: 'auto' }} />
        </button>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>IRON LOG v1.0 · Powered by Claude AI</span>
        </div>
        <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'transparent', color: 'var(--hot)', fontFamily: 'var(--font-display)', fontSize: 14, cursor: 'pointer', border: 0 }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function OptionRow({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '12px 14px', borderRadius: 'var(--r-md)', border: `1px solid ${selected ? 'var(--acc)' : 'var(--line)'}`, background: selected ? 'var(--acc-soft)' : 'var(--bg-2)', color: selected ? 'var(--acc)' : 'var(--ink-2)', fontFamily: 'var(--font-display)', fontSize: 14, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {label}
      {selected && <Icon name="check" size={14} color="var(--acc)" />}
    </button>
  )
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
}

function goalLabel(g) {
  const m = { volume: 'Ganar músculo / Volumen', strength: 'Fuerza pura', cut: 'Perder grasa / Definición', maintenance: 'Mantenimiento' }
  return m[g] || g || '—'
}
function levelLabel(l) {
  const m = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' }
  return m[l] || l || '—'
}
function equipLabel(e) {
  const m = { full_gym: 'Gimnasio completo', dumbbells_bar: 'Mancuernas + barra', dumbbells: 'Solo mancuernas', bodyweight: 'Peso corporal' }
  return m[e] || e || '—'
}
