import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCardio(userId) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    loadSessions()
  }, [userId])

  async function loadSessions(startDate, endDate) {
    setLoading(true)
    let query = supabase
      .from('cardio_calendar')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) setError(error.message)
    else setSessions(data || [])
    setLoading(false)
    return data || []
  }

  async function addSession(session) {
    const { data, error } = await supabase
      .from('cardio_calendar')
      .insert({ user_id: userId, ...session })
      .select()
      .single()
    if (error) throw error
    setSessions(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    return data
  }

  async function updateSession(id, updates) {
    const { data, error } = await supabase
      .from('cardio_calendar')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setSessions(prev => prev.map(s => s.id === id ? data : s))
    return data
  }

  async function deleteSession(id) {
    const { error } = await supabase.from('cardio_calendar').delete().eq('id', id)
    if (error) throw error
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  async function bulkInsert(sessionsArr) {
    const toInsert = sessionsArr.map(s => ({ user_id: userId, ...s }))
    const { data, error } = await supabase
      .from('cardio_calendar')
      .insert(toInsert)
      .select()
    if (error) throw error
    setSessions(prev => [...prev, ...(data || [])].sort((a, b) => a.date.localeCompare(b.date)))
    return data
  }

  function getSessionForDate(date) {
    return sessions.find(s => s.date === date) || null
  }

  function getTodaysSession() {
    const today = new Date().toISOString().split('T')[0]
    return getSessionForDate(today)
  }

  return {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    bulkInsert,
    getSessionForDate,
    getTodaysSession,
    loadSessions,
  }
}
