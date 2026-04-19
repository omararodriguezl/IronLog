import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNutrition } from '../hooks/useNutrition'
import MacroSummary from '../components/nutrition/MacroSummary'
import FoodEntry from '../components/nutrition/FoodEntry'
import BarcodeScanner from '../components/nutrition/BarcodeScanner'
import PhotoAnalyzer from '../components/nutrition/PhotoAnalyzer'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useToast } from '../components/ui/Toast'

export default function Nutrition() {
  const { profile } = useAuth()
  const today = new Date().toISOString().split('T')[0]
  const { entries, loading, addEntry, deleteEntry, getTotals, goals } = useNutrition(profile?.id, today)
  const toast = useToast()

  const [modal, setModal] = useState(null) // null | 'method' | 'photo' | 'barcode' | 'manual'
  const [saving, setSaving] = useState(false)
  const [manualForm, setManualForm] = useState({ meal_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' })
  const [errors, setErrors] = useState({})

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
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
          Nutrición
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '2px' }}>
          {new Date(today + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <MacroSummary totals={totals} goals={goals} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Registros de hoy
        </h2>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-dim)' }}>
          {entries.length} entradas
        </span>
      </div>

      {entries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-dim)' }}>
          <p style={{ fontSize: '40px', marginBottom: '8px' }}>🥗</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px' }}>Sin registros hoy</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Toca + para añadir tu primera comida</p>
        </div>
      )}

      {entries.map(entry => (
        <FoodEntry key={entry.id} entry={entry} onDelete={handleDelete} />
      ))}

      <button
        onClick={() => setModal('method')}
        style={{
          position: 'fixed',
          bottom: 'calc(var(--nav-height) + var(--safe-bottom) + 16px)',
          right: '16px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          color: '#0d1117',
          fontSize: '28px',
          fontWeight: '300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(57,211,83,0.4)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
          lineHeight: 1,
        }}
      >
        +
      </button>

      <Modal isOpen={modal === 'method'} onClose={() => setModal(null)} title="Añadir comida">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MethodButton icon="📷" title="Analizar foto con IA" desc="Claude identifica los alimentos y calcula macros" onClick={() => setModal('photo')} />
          <MethodButton icon="📦" title="Escanear código de barras" desc="Busca en Open Food Facts" onClick={() => setModal('barcode')} />
          <MethodButton icon="✏️" title="Entrada manual" desc="Introduce los valores directamente" onClick={() => setModal('manual')} />
        </div>
      </Modal>

      <Modal isOpen={modal === 'photo'} onClose={() => setModal(null)} title="Análisis de foto">
        <PhotoAnalyzer
          onConfirm={handleAdd}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal === 'barcode'} onClose={() => setModal(null)} title="Escáner de código de barras">
        <BarcodeScanner
          onConfirm={handleAdd}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal === 'manual'} onClose={() => setModal(null)} title="Entrada manual">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <Input
              label="Proteína (g)"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={manualForm.protein_g}
              onChange={e => setManualForm(f => ({ ...f, protein_g: e.target.value }))}
            />
            <Input
              label="Carbos (g)"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={manualForm.carbs_g}
              onChange={e => setManualForm(f => ({ ...f, carbs_g: e.target.value }))}
            />
            <Input
              label="Grasa (g)"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={manualForm.fat_g}
              onChange={e => setManualForm(f => ({ ...f, fat_g: e.target.value }))}
            />
          </div>
          <Button onClick={handleManualSubmit} loading={saving}>Guardar</Button>
        </div>
      </Modal>
    </div>
  )
}

function MethodButton({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        background: 'var(--color-surface-hover)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
    >
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '600' }}>{title}</p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{desc}</p>
      </div>
    </div>
  )
}
