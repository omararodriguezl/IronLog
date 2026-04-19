import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCardio } from '../hooks/useCardio'
import { parseCardioPDF } from '../lib/claude'
import CardioCalendar from '../components/cardio/CardioCalendar'
import CardioDay from '../components/cardio/CardioDay'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { cardioLabels } from '../theme'

const SESSION_TYPES = ['easy_run', 'intervals', 'tempo', 'long_run', 'race', 'rest']

export default function Cardio() {
  const { profile } = useAuth()
  const { sessions, addSession, updateSession, deleteSession, bulkInsert, getSessionForDate } = useCardio(profile?.id)
  const toast = useToast()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState(null) // null | 'add' | 'pdf'
  const [editingSession, setEditingSession] = useState(null)
  const [pdfParsing, setPdfParsing] = useState(false)

  const [form, setForm] = useState({
    date: selectedDate,
    session_type: 'easy_run',
    distance_miles: '',
    description: '',
  })

  function setF(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function openAdd(date) {
    setForm({ date: date || selectedDate, session_type: 'easy_run', distance_miles: '', description: '' })
    setEditingSession(null)
    setModal('add')
  }

  function openEdit(session) {
    setForm({
      date: session.date,
      session_type: session.session_type,
      distance_miles: session.distance_miles || '',
      description: session.description || '',
    })
    setEditingSession(session)
    setModal('add')
  }

  async function handleSave() {
    try {
      if (editingSession) {
        await updateSession(editingSession.id, form)
        toast.success('Sesión actualizada')
      } else {
        await addSession({ ...form, completed: false })
        toast.success('Sesión añadida')
      }
      setModal(null)
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handleToggle(id, completed) {
    try {
      await updateSession(id, { completed })
      toast.success(completed ? '✅ Completado' : 'Marcado como pendiente')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSession(id)
      toast.success('Eliminado')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handlePdfUpload(file) {
    if (!file) return
    setPdfParsing(true)
    try {
      const { base64, mediaType } = await readFileAsBase64(file)
      const parsed = await parseCardioPDF(base64, mediaType)
      if (parsed?.length > 0) {
        await bulkInsert(parsed)
        toast.success(`${parsed.length} sesiones importadas`)
        setModal(null)
      } else {
        toast.error('No se encontraron sesiones en el archivo')
      }
    } catch (err) {
      toast.error('Error al procesar el archivo: ' + err.message)
    } finally {
      setPdfParsing(false)
    }
  }

  function handleDayClick(date, session) {
    setSelectedDate(date)
    if (!session) openAdd(date)
  }

  const selectedSession = getSessionForDate(selectedDate)

  return (
    <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>
            Cardio
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setModal('pdf')}
              style={{
                padding: '8px 12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              📄 PDF
            </button>
            <button
              onClick={() => openAdd(null)}
              style={{
                padding: '8px 16px',
                background: 'var(--color-accent)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#0d1117',
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              + Añadir
            </button>
          </div>
        </div>
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '36px', height: '36px', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ←
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '13px', cursor: 'pointer', letterSpacing: '0.04em' }}
          >
            {weekOffset === 0 ? 'ESTA SEMANA' : weekOffset > 0 ? `+${weekOffset} sem` : `${weekOffset} sem`}
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '36px', height: '36px', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            →
          </button>
        </div>
        <CardioCalendar
          sessions={sessions}
          onDayClick={handleDayClick}
          selectedWeek={weekOffset}
        />
      </Card>

      {selectedDate && (
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <CardioDay
            session={selectedSession}
            date={selectedDate}
            onToggleComplete={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title={editingSession ? 'Editar sesión' : 'Nueva sesión de cardio'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={e => setF('date', e.target.value)}
          />
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Tipo de sesión
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {SESSION_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setF('session_type', type)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${form.session_type === type ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: form.session_type === type ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                    color: form.session_type === type ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                  }}
                >
                  {cardioLabels[type]}
                </button>
              ))}
            </div>
          </div>
          {form.session_type !== 'rest' && (
            <Input
              label="Distancia (millas)"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={form.distance_miles}
              onChange={e => setF('distance_miles', e.target.value)}
            />
          )}
          <Input
            label="Descripción (opcional)"
            placeholder="Ej: Rodaje por el parque"
            value={form.description}
            onChange={e => setF('description', e.target.value)}
          />
          <Button onClick={handleSave}>
            {editingSession ? 'Actualizar' : 'Guardar sesión'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'pdf'} onClose={() => setModal(null)} title="Importar plan desde PDF">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            Sube un PDF con tu plan de cardio. Claude extraerá las fechas, tipos de sesión y distancias automáticamente.
          </p>

          {pdfParsing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
              <Spinner size={40} />
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Procesando PDF con IA…</p>
            </div>
          ) : (
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '32px',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '40px' }}>📄</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '600' }}>
                Subir archivo PDF o TXT
              </span>
              <input
                type="file"
                accept=".pdf,.txt"
                style={{ display: 'none' }}
                onChange={e => handlePdfUpload(e.target.files[0])}
              />
            </label>
          )}

          <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  )
}

async function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      resolve({ base64, mediaType: file.type || 'application/pdf' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
