import React from 'react'

const methodIcons = { photo: '📷', manual: '✏️', barcode: '📦' }

export default function FoodEntry({ entry, onDelete }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '8px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <span style={{ fontSize: '20px', flexShrink: 0 }}>
        {methodIcons[entry.entry_method] || '🍽️'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--color-text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {entry.meal_name}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
          <MacroChip value={entry.protein_g} label="P" color="#bc8cff" />
          <MacroChip value={entry.carbs_g} label="C" color="#d29922" />
          <MacroChip value={entry.fat_g} label="G" color="#ff7b72" />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--color-text)' }}>
          {entry.calories}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>kcal</p>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '14px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

function MacroChip({ value, label, color }) {
  return (
    <span style={{
      fontSize: '11px',
      fontFamily: 'var(--font-body)',
      color: 'var(--color-text-muted)',
    }}>
      <span style={{ color }}>{label}</span> {Math.round(value || 0)}g
    </span>
  )
}
