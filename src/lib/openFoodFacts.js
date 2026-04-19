const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product'

export async function fetchProductByBarcode(barcode) {
  const response = await fetch(`${BASE_URL}/${barcode}.json`)
  if (!response.ok) throw new Error('No se pudo obtener el producto')

  const data = await response.json()
  if (data.status === 0 || !data.product) {
    throw new Error('Producto no encontrado en la base de datos')
  }

  const p = data.product
  const nutriments = p.nutriments || {}

  return {
    barcode,
    name: p.product_name || p.product_name_es || 'Producto desconocido',
    brand: p.brands || '',
    serving_size_g: parseFloat(p.serving_size) || 100,
    per_100g: {
      calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy_100g'] / 4.184 || 0),
      protein_g: parseFloat(nutriments['proteins_100g'] || 0),
      carbs_g: parseFloat(nutriments['carbohydrates_100g'] || 0),
      fat_g: parseFloat(nutriments['fat_100g'] || 0),
    },
    image_url: p.image_url || null,
  }
}

export function calculateNutrition(product, grams) {
  const ratio = grams / 100
  return {
    calories: Math.round(product.per_100g.calories * ratio),
    protein_g: parseFloat((product.per_100g.protein_g * ratio).toFixed(1)),
    carbs_g: parseFloat((product.per_100g.carbs_g * ratio).toFixed(1)),
    fat_g: parseFloat((product.per_100g.fat_g * ratio).toFixed(1)),
  }
}
