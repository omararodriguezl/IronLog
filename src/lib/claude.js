const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MODEL = 'claude-opus-4-5'
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
    const errorMsg = err.error?.message || `Claude API error ${response.status}`
    console.error('[Claude API error]', response.status, err)
    throw new Error(errorMsg)
  }

  const data = await response.json()
  const text = data.content[0].text
  console.log('[Claude raw response]', text.slice(0, 300))
  return text
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

  const system = `You are a world-class strength and conditioning coach with deep knowledge of periodization science. Respond with valid JSON only, no markdown, no extra text.`

  const userMessage = `Design the optimal workout program for this athlete. You decide everything based on exercise science.

Athlete profile:
- Goal: ${goalMap[goal] || goal}
- Training days/week: ${days}
- Experience level: ${levelMap[level] || level}
- Equipment: ${equipmentMap[equipment] || equipment}
- Physical limitations: ${injuries || 'None'}

YOUR DECISIONS (apply real periodization science):
1. Total weeks — optimal block length for this goal and level (typically 4-12 weeks)
2. Weekly structure — best split for the goal and days available (PPL, Upper/Lower, Full Body, etc.)
3. Deload placement — insert is_deload:true weeks where scientifically appropriate (not always every 4th week)
4. Session duration and rest periods — based on goal energy systems
5. Exercise selection — best exercises for the goal and equipment
6. Sets/reps — must match the goal (strength=1-5 reps, hypertrophy=6-15, endurance=15+)
7. Progression — realistic week-to-week progression in progression_note

RULES:
- Exercises defined ONCE in the "days" array (reused every week, only notes change per week)
- Max 5 exercises per day
- All text in Spanish EXCEPT english_name (must be in English for GIF lookup)
- Tips max 6 words
- total_weeks must be between 4 and 10
- english_name must be the standard English gym name (e.g. "Barbell Squat", "Pull Up", "Dumbbell Curl")

Return ONLY this JSON structure:
{
  "goal": "${goal}",
  "total_weeks": 8,
  "session_duration_minutes": 75,
  "rest_between_sets_seconds": 90,
  "weekly_structure": "PPL",
  "coach_rationale": "Breve justificación del programa en español (1-2 frases)",
  "days": [
    {
      "day_label": "Día A – Empuje (Pecho / Hombros / Tríceps)",
      "exercises": [
        {
          "id": "press_banca",
          "name": "Press de Banca",
          "english_name": "Barbell Bench Press",
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
    { "week_number": 1, "theme": "Adaptación neurológica", "is_deload": false, "progression_note": "Establece pesos de referencia al 70% RM" },
    { "week_number": 2, "theme": "Carga progresiva", "is_deload": false, "progression_note": "+2.5kg en ejercicios compuestos" }
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
