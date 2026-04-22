import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNutrition } from '../hooks/useNutrition'
import MacroSummary from '../components/nutrition/MacroSummary'
import FoodEntry from '../components/nutrition/FoodEntry'
import BarcodeScanner from '../components/nutrition/BarcodeScanner'
import PhotoAnalyzer from '../components/nutrition/PhotoAnalyzer'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import { useToast } from '../components/ui/Toast'

export default function Nutrition() {
  const { profile } = useAuth()
  const todayStr = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const { entries, loading, addEntry, deleteEntry, getTotals, goals, updateGoals } = useNutrition(profile?.id, selectedDate)
  const toast = useToast()

  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [manualForm, setManualForm] = useState({ meal_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
  const [errors, setErrors] = useState({})
  const [goalsForm, setGoalsForm] = useState(null)

  function shiftDate(days) {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + days)
    const s = d.toISOString().split('T')[0]
    if (s <= todayStr) setSelectedDate(s)
  }

  const isToday = selectedDate === todayStr

  async function handleAdd(entry) {
    setSaving(true)
    try {
      await addEntry(entry)
      toast.success('Alimento registrado')
      setModal(null)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteEntry(id)
      toast.success('Eliminado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  function validateManual() {
    const e = {}
    if (!manualForm.meal_name.trim()) e.meal_name = 'Requerido'
    if (!manualForm.calories || manualForm.calories <= 0) e.calories = 'Ingresa calorías válidas'
    return e
  }

  function handleManualSubmit() {
    const e = validateManual()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    handleAdd({
      meal_name: manualForm.meal_name.trim(),
      calories: parseInt(manualForm.calories) || 0,
      protein_g: parseFloat(manualForm.protein_g) || 0,
      carbs_g: parseFloat(manualForm.carbs_g) || 0,
      fat_g: parseFloat(manualForm.fat_g) || 0,
      entry_method: 'manual',
    })
    setManualForm({ meal_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
    setErrors({})
  }

  const totals = getTotals()

  return (
    <div className="iron-in" style={{ padding: '0 20px 32px', paddingTop: 'calc(var(--safe-top) + 60px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, lineHeight: 1.1 }}>Nutrición</div>
        <button
          onClick={() => { setGoalsForm({ ...goals }); setModal('goals') }}
          style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg-2)', color: 'var(--acc)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer', marginTop: 6 }}
        >
          METAS
        </button>
      </div>

      {/* Date navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => shiftDate(-1)} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, width: 32, height: 32, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="chevronL" size={15} />
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink-2)', textTransform: 'capitalize' }}>
            {isToday ? 'Hoy' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {!isToday && (
            <button onClick={() => setSelectedDate(todayStr)} style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--acc-soft)', border: '1px solid color-mix(in oklch, var(--acc) 30%, transparent)', color: 'var(--acc)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', cursor: 'pointer' }}>HOY</button>
          )}
          <button onClick={() => shiftDate(1)} disabled={isToday} style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, width: 32, height: 32, color: isToday ? 'var(--ink-4)' : 'var(--ink-3)', cursor: isToday ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronR" size={15} />
          </button>
        </div>
      </div>

      <MacroSummary totals={totals} goals={goals} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
        <span className="eyebrow">Registros del día</span>
        <span className="eyebrow">{entries.length} entradas</span>
      </div>

      {entries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-4)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🥗</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-3)' }}>Sin registros</div>
          <div style={{ fontSize: 13, marginTop: 4, color: 'var(--ink-4)' }}>Toca + para añadir tu primera comida</div>
        </div>
      )}

      {entries.map(entry => (
        <FoodEntry key={entry.id} entry={entry} onDelete={handleDelete} />
      ))}

      {/* FAB */}
      {isToday && (
        <button
          onClick={() => setModal('method')}
          style={{
            position: 'fixed',
            bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 16px)',
            right: 16,
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'var(--acc)',
            color: 'var(--acc-ink)',
            border: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px color-mix(in oklch, var(--acc) 40%, transparent)',
            cursor: 'pointer',
            zIndex: 50,
          }}
        >
          <Icon name="plus" size={24} color="currentColor" stroke={2} />
        </button>
      )}

      {/* Method picker modal */}
      <Modal isOpen={modal === 'method'} onClose={() => setModal(null)} title="Añadir comida">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MethodButton icon="📷" title="Analizar foto con IA" desc="Claude identifica los alimentos y calcula macros" onClick={() => setModal('photo')} />
          <MethodButton icon="📦" title="Escanear código de barras" desc="Busca en Open Food Facts" onClick={() => setModal('barcode')} />
          <MethodButton icon="✏️" title="Entrada manual" desc="Introduce los valores directamente" onClick={() => setModal('manual')} />
        </div>
      </Modal>

      <Modal isOpen={modal === 'photo'} onClose={() => setModal(null)} title="Análisis de foto">
        <PhotoAnalyzer onConfirm={handleAdd} onClose={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'barcode'} onClose={() => setModal(null)} title="Escáner de código de barras">
        <BarcodeScanner onConfirm={handleAdd} onClose={() => setModal(null)} />
      </Modal>

      {/* Goals modal */}
      <Modal isOpen={modal === 'goals'} onClose={() => setModal(null)} title="Editar metas">
        {goalsForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Calorías (kcal)" type="number" inputMode="numeric" value={goalsForm.calories} onChange={e => setGoalsForm(f => ({ ...f, calories: parseInt(e.target.value) || 0 }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <Input label="Proteína (g)" type="number" inputMode="numeric" value={goalsForm.protein_g} onChange={e => setGoalsForm(f => ({ ...f, protein_g: parseInt(e.target.value) || 0 }))} />
              <Input label="Carbos (g)" type="number" inputMode="numeric" value={goalsForm.carbs_g} onChange={e => setGoalsForm(f => ({ ...f, carbs_g: parseInt(e.target.value) || 0 }))} />
              <Input label="Grasa (g)" type="number" inputMode="numeric" value={goalsForm.fat_g} onChange={e => setGoalsForm(f => ({ ...f, fat_g: parseInt(e.target.value) || 0 }))} />
            </div>
            <button
              onClick={() => { updateGoals(goalsForm); setModal(null); toast.success('Metas actualizadas') }}
              style={{ width: '100%', height: 50, borderRadius: 14, background: 'var(--acc)', color: 'var(--acc-ink)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Guardar metas
            </button>
          </div>
        )}
      </Modal>

      {/* Manual entry modal */}
      <Modal isOpen={modal === 'manual'} onClose={() => setModal(null)} title="Entrada manual">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Nombre del alimento"
            placeholder="Ej: Pollo a la plancha"
            value={manualForm.meal_name}
            onChange={e => setManualForm(f => ({ ...f, meal_name: e.target.value }))}
            error={errors.meal_name}
          />
          <Input
            label="Calorías (kcal)"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={manualForm.calories}
            onChange={e => setManualForm(f => ({ ...f, calories: e.target.value }))}
            error={errors.calories}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Input label="Proteína (g)" type="number" inputMode="decimal" placeholder="0" value={manualForm.protein_g} onChange={e => setManualForm(f => ({ ...f, protein_g: e.target.value }))} />
            <Input label="Carbos (g)" type="number" inputMode="decimal" placeholder="0" value={manualForm.carbs_g} onChange={e => setManualForm(f => ({ ...f, carbs_g: e.target.value }))} />
            <Input label="Grasa (g)" type="number" inputMode="decimal" placeholder="0" value={manualForm.fat_g} onChange={e => setManualForm(f => ({ ...f, fat_g: e.target.value }))} />
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={saving}
            style={{ width: '100%', height: 50, borderRadius: 14, background: 'var(--acc)', color: 'var(--acc-ink)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function MethodButton({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}
    >
      <span style={{ fontSize: 26 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}
