import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Button from '../ui/Button'
import { fetchProductByBarcode, calculateNutrition } from '../../lib/openFoodFacts'
import Spinner from '../ui/Spinner'

export default function BarcodeScanner({ onConfirm, onClose }) {
  const [phase, setPhase] = useState('scan') // scan | confirm | error
  const [product, setProduct] = useState(null)
  const [grams, setGrams] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const divId = 'barcode-scanner-reader'

  useEffect(() => {
    const scanner = new Html5Qrcode(divId)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 280, height: 140 } },
      async (decodedText) => {
        scanner.stop()
        setLoading(true)
        try {
          const p = await fetchProductByBarcode(decodedText)
          setProduct(p)
          setGrams(p.serving_size_g || 100)
          setPhase('confirm')
        } catch (err) {
          setError(err.message)
          setPhase('error')
        } finally {
          setLoading(false)
        }
      },
      () => {}
    ).catch(err => {
      setError('No se pudo acceder a la cámara: ' + err)
      setPhase('error')
    })

    return () => {
      scanner.isScanning && scanner.stop().catch(() => {})
    }
  }, [])

  function handleConfirm() {
    if (!product) return
    const nutrition = calculateNutrition(product, grams)
    onConfirm({
      meal_name: `${product.name}${product.brand ? ` (${product.brand})` : ''}`,
      ...nutrition,
      entry_method: 'barcode',
    })
  }

  const nutrition = product ? calculateNutrition(product, grams) : null

  if (phase === 'scan') {
    return (
      <div>
        <div id={divId} style={{
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000',
          minHeight: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {loading && <Spinner />}
        </div>
        <p style={{
          marginTop: '12px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
          fontFamily: 'var(--font-body)',
        }}>
          Apunta al código de barras del producto
        </p>
        <div style={{ marginTop: '16px' }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</p>
        <p style={{ color: 'var(--color-danger)', marginBottom: '20px' }}>{error}</p>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {product?.image_url && (
          <img src={product.image_url} alt={product.name} style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            flexShrink: 0,
            background: '#fff',
          }} />
        )}
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700' }}>
            {product?.name}
          </p>
          {product?.brand && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{product.brand}</p>
          )}
        </div>
      </div>

      <div>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '8px',
        }}>
          Cantidad (gramos)
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={grams}
          onChange={e => setGrams(Math.max(1, parseFloat(e.target.value) || 1))}
          style={{
            width: '100%',
            minHeight: '48px',
            padding: '12px 14px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            outline: 'none',
            textAlign: 'center',
          }}
        />
      </div>

      {nutrition && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <NutritionStat label="Kcal" value={nutrition.calories} color="var(--color-accent)" />
          <NutritionStat label="Prot" value={`${nutrition.protein_g}g`} color="#bc8cff" />
          <NutritionStat label="Carbs" value={`${nutrition.carbs_g}g`} color="#d29922" />
          <NutritionStat label="Grasa" value={`${nutrition.fat_g}g`} color="#ff7b72" />
        </div>
      )}

      <Button onClick={handleConfirm}>Confirmar y guardar</Button>
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
    </div>
  )
}

function NutritionStat({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--color-surface-hover)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 8px',
      textAlign: 'center',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}
