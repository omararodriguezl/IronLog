// Design tokens — Iron redesign
// New vars: --bg, --bg-1..3, --line, --ink..4, --acc, --hero-*
// Legacy aliases kept so existing components don't break

export const cssVars = `
  /* ── dark (default) ─────────────────────────── */
  :root, [data-theme="dark"] {
    /* ── new tokens ─────────────────────────────── */
    --bg:   #0a0b0a;
    --bg-1: #0f1110;
    --bg-2: #16181a;
    --bg-3: #1d2022;
    --line: rgba(255,255,255,0.08);
    --line-strong: rgba(255,255,255,0.14);
    --ink:   #f4f5f3;
    --ink-2: #c8cac5;
    --ink-3: #8a8d86;
    --ink-4: #555853;

    --hero-bg:      #f4f5f3;
    --hero-ink:     #0a0b0a;
    --hero-ink-2:   rgba(0,0,0,0.55);
    --hero-ink-3:   rgba(0,0,0,0.75);
    --hero-chip-bg: rgba(0,0,0,0.08);
    --hero-btn-bg:  #0a0b0a;

    --acc:      oklch(0.82 0.19 145);
    --acc-deep: oklch(0.68 0.19 145);
    --acc-soft: oklch(0.82 0.19 145 / 0.12);
    --acc-ink:  #0a0f09;

    --warn: oklch(0.82 0.15 75);
    --cool: oklch(0.78 0.12 235);
    --hot:  oklch(0.72 0.20 25);

    --font-display: 'Geist', -apple-system, system-ui, sans-serif;
    --font-mono:    'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    --font-serif:   'Instrument Serif', ui-serif, Georgia, serif;

    --r-sm: 6px;
    --r-md: 12px;
    --r-lg: 18px;
    --r-xl: 24px;

    /* ── legacy aliases (existing components) ────── */
    --color-bg:           var(--bg);
    --color-surface:      var(--bg-1);
    --color-surface-hover:var(--bg-2);
    --color-border:       var(--line-strong);
    --color-accent:       var(--acc);
    --color-accent-dim:   var(--acc-soft);
    --color-danger:       var(--hot);
    --color-warning:      var(--warn);
    --color-text:         var(--ink);
    --color-text-muted:   var(--ink-3);
    --color-text-dim:     var(--ink-4);
    --font-body:          var(--font-mono);
    --radius-sm:  var(--r-sm);
    --radius-md:  var(--r-md);
    --radius-lg:  var(--r-lg);
    --radius-xl:  var(--r-xl);
    --radius-full: 9999px;

    --safe-top:    env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left:   env(safe-area-inset-left, 0px);
    --safe-right:  env(safe-area-inset-right, 0px);
    --nav-height: 68px;

    --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.3);
  }

  /* ── light theme ────────────────────────────── */
  [data-theme="light"] {
    --bg:   #f5f6f3;
    --bg-1: #ffffff;
    --bg-2: #eceeed;
    --bg-3: #e0e3de;
    --line: rgba(0,0,0,0.07);
    --line-strong: rgba(0,0,0,0.13);
    --ink:   #0a0b0a;
    --ink-2: #282b26;
    --ink-3: #6b6e68;
    --ink-4: #9b9e98;

    --hero-bg:      #0a0b0a;
    --hero-ink:     #f4f5f3;
    --hero-ink-2:   rgba(255,255,255,0.6);
    --hero-ink-3:   rgba(255,255,255,0.8);
    --hero-chip-bg: rgba(255,255,255,0.12);
    --hero-btn-bg:  #f4f5f3;

    --acc:      oklch(0.55 0.19 145);
    --acc-deep: oklch(0.45 0.19 145);
    --acc-soft: oklch(0.55 0.19 145 / 0.10);
    --acc-ink:  #ffffff;

    --color-bg:           var(--bg);
    --color-surface:      var(--bg-1);
    --color-surface-hover:var(--bg-2);
    --color-border:       var(--line-strong);
    --color-accent:       var(--acc);
    --color-accent-dim:   var(--acc-soft);
    --color-text:         var(--ink);
    --color-text-muted:   var(--ink-3);
    --color-text-dim:     var(--ink-4);

    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
  }
`

export const cardioColors = {
  easy_run: 'var(--acc)',
  intervals: 'var(--hot)',
  tempo: 'var(--warn)',
  long_run: 'var(--cool)',
  race: 'oklch(0.78 0.14 300)',
  rest: 'var(--ink-4)',
}

export const cardioLabels = {
  easy_run: 'Rodaje suave',
  intervals: 'Intervalos',
  tempo: 'Tempo',
  long_run: 'Tirada larga',
  race: 'Carrera',
  rest: 'Descanso',
}

export const muscleGroupColors = {
  Chest: 'var(--hot)',
  Back: 'var(--cool)',
  Shoulders: 'var(--warn)',
  Biceps: 'oklch(0.78 0.14 300)',
  Triceps: 'var(--hot)',
  Legs: 'var(--acc)',
  Quads: 'var(--acc)',
  Hamstrings: 'var(--acc-deep)',
  Glutes: 'var(--acc-deep)',
  Core: 'var(--cool)',
  Abs: 'var(--cool)',
  Calves: 'var(--cool)',
  Cardio: 'var(--warn)',
}
