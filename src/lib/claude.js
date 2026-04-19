const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MODEL = 'claude-opus-4-7'
const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude({ messages, maxTokens = 4096, system }) {
  if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key no configurada')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

export async function generateWorkoutPlan({ goal, days, level, equipment, injuries }) {
  const goalMap = {
    volume: 'Ganar músculo / Volumen',
    strength: 'Fuerza pura',
    cut: 'Perder grasa / Definición',
    maintenance: 'Mantenimiento',
  }
  const equipmentMap = {
    full_gym: 'Gimnasio completo',
    dumbbells_bar: 'Mancuernas + barra',
    dumbbells: 'Solo mancuernas',
    bodyweight: 'Solo peso corporal',
  }
  const levelMap = {
    beginner: 'Principiante (< 1 año)',
    intermediate: 'Intermedio (1-3 años)',
    advanced: 'Avanzado (3+ años)',
  }

  const totalWeeks = 4
  const system = `You are an expert strength coach. Respond with valid JSON only, no markdown, no extra text.`

  const userMessage = `Create a ${totalWeeks}-week workout plan. The exercises are the SAME every week — only sets/reps change for progression.

User:
- Goal: ${goalMap[goal] || goal}
- Days/week: ${days}
- Level: ${levelMap[level] || level}
- Equipment: ${equipmentMap[equipment] || equipment}
- Limitations: ${injuries || 'None'}

IMPORTANT:
- "days" array is defined ONCE (week 1 template, reused all weeks)
- Each week only has: week_number, theme, is_deload, progression_note
- Week ${totalWeeks} is deload
- Max 5 exercises per day
- All Spanish text
- Tips max 6 words

Return ONLY this JSON:
{
  "goal": "${goal}",
  "total_weeks": ${totalWeeks},
  "session_duration_minutes": 70,
  "rest_between_sets_seconds": 90,
  "weekly_structure": "Full Body",
  "days": [
    {
      "day_label": "Día A – Empuje",
      "exercises": [
        {
          "id": "press_banca",
          "name": "Press de Banca",
          "muscle_group": "Chest",
          "sets": 4,
          "reps": "8-10",
          "rest_seconds": 90,
          "tip": "Retrae escápulas, arco natural"
        }
      ]
    }
  ],
  "weeks": [
    { "week_number": 1, "theme": "Semana de base", "is_deload": false, "progression_note": "Establece tus pesos de referencia" },
    { "week_number": 2, "theme": "Semana de carga", "is_deload": false, "progression_note": "+2.5kg en ejercicios principales" },
    { "week_number": 3, "theme": "Semana de intensidad", "is_deload": false, "progression_note": "+2.5kg, reduce 1 rep por serie" },
    { "week_number": 4, "theme": "Semana de descarga", "is_deload": true, "progression_note": "Reduce peso 40%, mismas series" }
  ]
}`

  const text = await callClaude({
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 16000,
    system,
  })

  // Extract JSON robustly — find first { and last }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('La respuesta de Claude no contiene JSON válido')
  const jsonStr = text.slice(start, end + 1)

  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    throw new Error('Error al procesar el plan generado. Intenta de nuevo.')
  }
}

export async function analyzeFood(base64Image, mimeType = 'image/jpeg') {
  const system = `You are a sports nutritionist. Always respond with valid JSON only, no markdown, no explanation.`

  const text = await callClaude({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this food photo and respond ONLY in this exact JSON format:
{
  "meal_name": "Pollo a la plancha con arroz y verduras",
  "calories": 650,
  "protein_g": 48,
  "carbs_g": 72,
  "fat_g": 12,
  "foods_identified": ["pechuga de pollo a la plancha", "arroz blanco", "brócoli", "aceite de oliva"],
  "confidence": "high",
  "note": "Estimado para una porción estándar de restaurante"
}
Confidence must be "high", "medium", or "low". Do NOT save or reference the image. Only return nutritional analysis.`,
          },
        ],
      },
    ],
    maxTokens: 1024,
    system,
  })

  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(cleaned)
}

export async function generateCoachAnalysis({ profile, session, sessionHistory, cardioToday }) {
  const system = `Eres un entrenador de fuerza y acondicionamiento de élite. Responde siempre en español. Sé directo, específico y motivador. Usa emojis con moderación. Máximo 250 palabras.`

  const exerciseText = session?.exercises
    ? session.exercises.map(ex =>
        `${ex.name}: ${ex.sets?.map((s, i) => `Serie ${i + 1}: ${s.reps} reps × ${s.weight}kg`).join(', ')}`
      ).join('\n')
    : 'Sin sesión registrada hoy'

  const historyText = sessionHistory?.length
    ? sessionHistory.map(s =>
        `${s.date} — ${s.day_label}: ${s.exercises?.map(e => e.name).join(', ')}`
      ).join('\n')
    : 'Sin historial reciente'

  const userMessage = `PERFIL DEL USUARIO:
- Objetivo: ${profile.goal}
- Nivel: ${profile.level}
- Semana actual: ${profile.current_week} de ${profile.total_weeks}

SESIÓN DE HOY (${session?.date || 'hoy'} — ${session?.day_label || 'sin sesión'}):
${exerciseText}

ÚLTIMAS 3 SESIONES:
${historyText}

CARDIO DE HOY:
${cardioToday ? `${cardioToday.session_type} — ${cardioToday.distance_miles} millas — ${cardioToday.description}` : 'Sin cardio programado'}

Proporciona:
1. Recomendaciones de progresión específicas — nombra el ejercicio exacto y el aumento de peso exacto
2. Observación sobre la tendencia de progreso
3. Un cue técnico de entrenamiento para esta semana
4. Alerta si hay conflicto entre el cardio de hoy y la sesión de gym`

  return await callClaude({
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 1024,
    system,
  })
}

export async function parseCardioPDF(text) {
  const system = `You are a running coach assistant. Always respond with valid JSON only, no markdown, no explanation.`

  const userMessage = `Extract the workout schedule from this training plan text and return ONLY a JSON array.
Session types must be one of: easy_run, intervals, tempo, long_run, race, rest

[
  {
    "date": "2026-04-13",
    "session_type": "easy_run",
    "distance_miles": 3.25,
    "description": "Rodaje suave 3.25 millas"
  }
]

Training plan text:
${text}`

  const result = await callClaude({
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 4096,
    system,
  })

  const cleaned = result.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(cleaned)
}
