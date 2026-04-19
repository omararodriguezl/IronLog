import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateCoachAnalysis } from '../lib/claude'

export function useCoach(userId) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastAnalyzed, setLastAnalyzed] = useState(null)

  useEffect(() => {
    if (!userId) return
    loadLastAnalysis()
  }, [userId])

  async function loadLastAnalysis() {
    const saved = localStorage.getItem(`coach_analysis_${userId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setAnalysis(parsed.text)
      setLastAnalyzed(parsed.date)
    }
  }

  async function analyze(profile, activePlan) {
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(4)

      const { data: cardio } = await supabase
        .from('cardio_calendar')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      const todaySession = sessions?.[0]?.date === today ? sessions[0] : null
      const history = sessions?.slice(todaySession ? 1 : 0, 4) || []

      const text = await generateCoachAnalysis({
        profile: {
          goal: profile.goal,
          level: profile.level,
          current_week: activePlan?.current_week || 1,
          total_weeks: activePlan?.plan_json?.total_weeks || 8,
        },
        session: todaySession,
        sessionHistory: history,
        cardioToday: cardio || null,
      })

      setAnalysis(text)
      setLastAnalyzed(new Date().toISOString())
      localStorage.setItem(`coach_analysis_${userId}`, JSON.stringify({
        text,
        date: new Date().toISOString(),
      }))

      return text
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { analysis, loading, error, lastAnalyzed, analyze }
}
