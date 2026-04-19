import React from 'react'
import MacroRing from '../ui/MacroRing'
import Card from '../ui/Card'

export default function MacroSummary({ totals, goals }) {
  const caloriePct = Math.min(Math.round((totals.calories / goals.calories) * 100), 999)

  return (
    <Card style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Calorías hoy
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--color-text)' }}>
              {Math.round(totals.calories)}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              / {goals.calories} kcal
            </span>
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          background: caloriePct >= 90 ? 'var(--color-accent-dim)' : 'var(--color-surface-hover)',
          border: `1px solid ${caloriePct >= 90 ? 'var(--color-accent)' : 'var(--color-border)'}`,
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          fontWeight: '700',
          color: caloriePct >= 90 ? 'var(--color-accent)' : 'var(--color-text-muted)',
        }}>
          {caloriePct}%
        </div>
      </div>

      <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(caloriePct, 100)}%`,
          background: caloriePct > 100 ? 'var(--color-danger)' : 'var(--color-accent)',
          borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', justifyItems: 'center' }}>
        <MacroRing label="Proteína" current={totals.protein_g} goal={goals.protein_g} color="#bc8cff" />
        <MacroRing label="Carbos" current={totals.carbs_g} goal={goals.carbs_g} color="#d29922" />
        <MacroRing label="Grasa" current={totals.fat_g} goal={goals.fat_g} color="#ff7b72" />
      </div>
    </Card>
  )
}
