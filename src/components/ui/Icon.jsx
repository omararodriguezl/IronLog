import React from 'react'

const PATHS = {
  home:     <><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9v12h14V9"/></>,
  dumbbell: <><path d="M3 10v4M5 8v8M19 8v8M21 10v4M5 12h14"/></>,
  fork:     <><path d="M7 3v7a2 2 0 002 2v9"/><path d="M11 3v7"/><path d="M15 3v18"/><path d="M15 12h3a2 2 0 002-2V3"/></>,
  run:      <><circle cx="14" cy="4.5" r="1.5"/><path d="M8 21l3-6-2-3 4-3 3 3h3M7 13l-2 4"/></>,
  user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></>,
  flame:    <><path d="M12 3c0 4-4 4-4 9a4 4 0 008 0c0-2-1-3-2-4 1 3-2 3-2 0 0-3 0-5 0-5z"/></>,
  plus:     <><path d="M12 5v14M5 12h14"/></>,
  chevronR: <><path d="M9 6l6 6-6 6"/></>,
  chevronL: <><path d="M15 6l-9 6 9 6"/></>,
  chevronD: <><path d="M6 9l6 6 6-6"/></>,
  chevronU: <><path d="M6 15l6-6 6 6"/></>,
  check:    <><path d="M5 12l5 5 9-11"/></>,
  x:        <><path d="M6 6l12 12M18 6L6 18"/></>,
  play:     <><path d="M7 4v16l13-8L7 4z" fill="currentColor" stroke="none"/></>,
  pause:    <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
  sparkle:  <><path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z"/></>,
  bolt:     <><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  pdf:      <><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"/><path d="M14 3v6h6"/></>,
  edit:     <><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/></>,
  refresh:  <><path d="M20 8A8 8 0 005 5M4 16a8 8 0 0015 3"/><path d="M20 3v5h-5M4 21v-5h5"/></>,
  trash:    <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>,
  arrowR:   <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  trend:    <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
  bell:     <><path d="M6 8a6 6 0 0112 0v5l2 3H4l2-3V8z"/><path d="M10 20a2 2 0 004 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>,
  mic:      <><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></>,
}

export default function Icon({ name, size = 20, color = 'currentColor', stroke = 1.6, style }) {
  const p = PATHS[name]
  if (!p) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {p}
    </svg>
  )
}
