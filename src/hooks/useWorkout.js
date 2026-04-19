import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useWorkout(userId) {
  const [activePlan, setActivePlan] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    loadActivePlan()
    loadRecentSessions()
  }, [userId])

  async function loadActivePlan() {
    setLoading(true)
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') setError(error.message)
    else setActivePlan(data)
    setLoading(false)
  }

  async function loadRecentSessions() {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30)
    setSessions(data || [])
  }

  async function savePlan(planData) {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        plan_json: planData,
        goal: planData.goal,
        total_weeks: planData.total_weeks,
        current_week: 1,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()
    if (error) throw error
    setActivePlan(data)
    return data
  }

  async function saveSession(sessionData) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({ user_id: userId, ...sessionData })
      .select()
      .single()
    if (error) throw error
    setSessions(prev => [data, ...prev])
    return data
  }

  async function deleteSession(id) {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
    if (error) throw error
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  async function deleteAllSessions() {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
    setSessions([])
  }

  async function updateCurrentWeek(planId, week) {
    const { error } = await supabase
      .from('workout_plans')
      .update({ current_week: week })
      .eq('id', planId)
    if (error) throw error
    setActivePlan(prev => prev ? { ...prev, current_week: week } : prev)
  }

  function getDays() {
    const plan = activePlan?.plan_json
    if (!plan) return []
    if (plan.days) return plan.days
    const week = plan.weeks?.find(w => w.week_number === activePlan.current_week)
    return week?.days || []
  }

  function getTodaysDayIndex() {
    const days = getDays()
    if (!days.length) return null
    const dayOfWeek = new Date().getDay()
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    return adjustedDay % days.length
  }

  function getTodaysSession() {
    const days = getDays()
    if (!days.length) return null
    const idx = getTodaysDayIndex()
    return days[idx ?? 0]
  }

  function getCurrentWeekData() {
    if (!activePlan?.plan_json?.weeks) return null
    const week = activePlan.plan_json.weeks.find(w => w.week_number === activePlan.current_week) || null
    if (week && !week.days) week.days = getDays()
    return week
  }

  return {
    activePlan,
    sessions,
    loading,
    error,
    savePlan,
    saveSession,
    deleteSession,
    deleteAllSessions,
    updateCurrentWeek,
    getTodaysSession,
    getCurrentWeekData,
    reload: loadActivePlan,
    reloadSessions: loadRecentSessions,
  }
}
