export const colors = {
  background: '#0d1117',
  surface: '#161b22',
  surfaceHover: '#1c2128',
  border: '#30363d',
  accent: '#39d353',
  accentDim: '#1a4a26',
  danger: '#f85149',
  warning: '#d29922',
  text: '#e6edf3',
  textMuted: '#8b949e',
  textDim: '#484f58',
}

export const fonts = {
  display: "'Oswald', sans-serif",
  body: "'DM Mono', monospace",
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
}

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
}

export const cssVars = `
  :root {
    --color-bg: ${colors.background};
    --color-surface: ${colors.surface};
    --color-surface-hover: ${colors.surfaceHover};
    --color-border: ${colors.border};
    --color-accent: ${colors.accent};
    --color-accent-dim: ${colors.accentDim};
    --color-danger: ${colors.danger};
    --color-warning: ${colors.warning};
    --color-text: ${colors.text};
    --color-text-muted: ${colors.textMuted};
    --color-text-dim: ${colors.textDim};
    --font-display: ${fonts.display};
    --font-body: ${fonts.body};
    --radius-sm: ${radii.sm};
    --radius-md: ${radii.md};
    --radius-lg: ${radii.lg};
    --radius-xl: ${radii.xl};
    --radius-full: ${radii.full};
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
    --nav-height: 64px;
  }
`

export const muscleGroupColors = {
  Chest: '#f85149',
  Back: '#388bfd',
  Shoulders: '#d29922',
  Biceps: '#bc8cff',
  Triceps: '#ff7b72',
  Legs: '#39d353',
  Quads: '#39d353',
  Hamstrings: '#26a641',
  Glutes: '#2ea043',
  Core: '#58a6ff',
  Abs: '#58a6ff',
  Calves: '#79c0ff',
  Cardio: '#ff9a3c',
}

export const cardioColors = {
  easy_run: '#39d353',
  intervals: '#f85149',
  tempo: '#d29922',
  long_run: '#388bfd',
  race: '#bc8cff',
  rest: '#484f58',
}

export const cardioLabels = {
  easy_run: 'Rodaje suave',
  intervals: 'Intervalos',
  tempo: 'Tempo',
  long_run: 'Tirada larga',
  race: 'Carrera',
  rest: 'Descanso',
}
