import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCardio } from '../hooks/useCardio'
import { parseCardioPDF } from '../lib/claude'
import CardioCalendar from '../components/cardio/CardioCalendar'
import CardioDay from '../components/cardio/CardioDay'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Icon from '../components/ui/Icon'
import { useToast } from '../components/ui/Toast'
import { cardioLabels } from '../theme'

const SESSION_TYPES = ['easy_run', 'intervals', 'tempo', 'long_run', 'race', 'rest']

export default function Cardio() {
  const { profile } = useAuth()
  const { sessions, addSession, updateSession, deleteSession, bulkInsert, getSessionForDate } = useCardio(profile?.id)
  const toast = useToast()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState(null)
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
    <div className="iron-in" style={{ padding: '0 20px 32px', paddingTop: 'calc(var(--safe-top) + 56px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, lineHeight: 1.1 }}>Cardio</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button
            onClick={() => setModal('pdf')}
            style={{ padding: '6px 12px', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="pdf" size={13} color="var(--ink-3)" />
            PDF
          </button>
          <button
            onClick={() => openAdd(null)}
            style={{ padding: '6px 14px', background: 'var(--acc)', border: 0, borderRadius: 8, color: 'var(--acc-ink)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="plus" size={13} color="currentColor" stroke={2} />
            AÑADIR
          </button>
        </div>
      </div>

      {/* Week strip */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, width: 34, height: 34, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="chevronL" size={15} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            style={{ background: 'none', border: 'none', color: weekOffset === 0 ? 'var(--acc)' : 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer' }}
          >
            {weekOffset === 0 ? 'ESTA SEMANA' : weekOffset > 0 ? `+${weekOffset} SEM` : `${weekOffset} SEM`}
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8, width: 34, height: 34, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="chevronR" size={15} />
          </button>
        </div>
        <CardioCalendar
          sessions={sessions}
          onDayClick={handleDayClick}
          selectedWeek={weekOffset}
        />
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 10, textTransform: 'capitalize' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <CardioDay
            session={selectedSession}
            date={selectedDate}
            onToggleComplete={handleToggle}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title={editingSession ? 'Editar sesión' : 'Nueva sesión de cardio'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={e => setF('date', e.target.value)}
          />
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Tipo de sesión</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SESSION_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setF('session_type', type)}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: `1px solid ${form.session_type === type ? 'color-mix(in oklch, var(--acc) 40%, transparent)' : 'var(--line)'}`,
                    background: form.session_type === type ? 'var(--acc-soft)' : 'var(--bg-2)',
                    color: form.session_type === type ? 'var(--acc)' : 'var(--ink-3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
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
          <button
            onClick={handleSave}
            style={{ width: '100%', height: 50, borderRadius: 14, background: 'var(--acc)', color: 'var(--acc-ink)', border: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
          >
            {editingSession ? 'Actualizar' : 'Guardar sesión'}
          </button>
        </div>
      </Modal>

      {/* PDF import modal */}
      <Modal isOpen={modal === 'pdf'} onClose={() => setModal(null)} title="Importar plan desde PDF">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            Sube un PDF con tu plan de cardio. Claude extraerá las fechas, tipos de sesión y distancias automáticamente.
          </div>

          {pdfParsing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--line)', borderTopColor: 'var(--acc)', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Procesando PDF con IA…</div>
            </div>
          ) : (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              padding: '32px', border: '2px dashed var(--line-strong)', borderRadius: 14,
              cursor: 'pointer', textAlign: 'center',
            }}>
              <Icon name="pdf" size={40} color="var(--ink-4)" />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>Subir archivo PDF o TXT</div>
              <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => handlePdfUpload(e.target.files[0])} />
            </label>
          )}

          <button
            onClick={() => setModal(null)}
            style={{ width: '100%', height: 46, borderRadius: 12, background: 'var(--bg-2)', color: 'var(--ink-3)', border: '1px solid var(--line)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancelar
          </button>
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
