import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_GOALS = {
  calories: 2200,
  protein_g: 150,
  carbs_g: 250,
  fat_g: 65,
}

function loadGoals(userId) {
  if (!userId) return DEFAULT_GOALS
  try {
    const stored = localStorage.getItem(`nutrition_goals_${userId}`)
    return stored ? { ...DEFAULT_GOALS, ...JSON.parse(stored) } : DEFAULT_GOALS
  } catch {
    return DEFAULT_GOALS
  }
}

export function useNutrition(userId, date) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [goals, setGoals] = useState(() => loadGoals(userId))

  const targetDate = date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    setGoals(loadGoals(userId))
  }, [userId])

  useEffect(() => {
    if (!userId) return
    loadEntries()
  }, [userId, targetDate])

  async function loadEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setEntries(data || [])
    setLoading(false)
  }

  async function addEntry(entry) {
    const { data, error } = await supabase
      .from('food_log')
      .insert({ user_id: userId, date: targetDate, ...entry })
      .select()
      .single()
    if (error) throw error
    setEntries(prev => [...prev, data])
    return data
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('food_log').delete().eq('id', id)
    if (error) throw error
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateGoals(newGoals) {
    const merged = { ...goals, ...newGoals }
    setGoals(merged)
    if (userId) localStorage.setItem(`nutrition_goals_${userId}`, JSON.stringify(merged))
  }

  function getTotals() {
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + (e.calories || 0),
        protein_g: acc.protein_g + (e.protein_g || 0),
        carbs_g: acc.carbs_g + (e.carbs_g || 0),
        fat_g: acc.fat_g + (e.fat_g || 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    )
  }

  return {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    getTotals,
    goals,
    updateGoals,
    reload: loadEntries,
  }
}
