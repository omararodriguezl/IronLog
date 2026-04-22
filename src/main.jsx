import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { cssVars } from './theme.js'

const style = document.createElement('style')
style.textContent = `
  ${cssVars}

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  body {
    background-color: var(--bg);
    color: var(--ink);
    font-family: var(--font-display);
    min-height: 100dvh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "ss01","cv11";
  }

  #root {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  input, textarea, select, button {
    font-family: var(--font-display);
    font-size: 16px;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

  /* ── design system utilities ─────────────────────────── */
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .mono { font-family: var(--font-mono); font-feature-settings: "zero","ss02"; }
  .serif { font-family: var(--font-serif); font-style: italic; }
  .tabular { font-variant-numeric: tabular-nums; }
  .hairline { background: var(--line); height: 1px; width: 100%; }

  .card {
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 20px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid var(--line-strong);
    background: var(--bg-2);
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.04em;
    color: var(--ink-2);
    text-transform: uppercase;
  }
  .chip.acc { color: var(--acc); border-color: color-mix(in oklch, var(--acc) 35%, transparent); background: var(--acc-soft); }

  .bar {
    height: 4px;
    background: var(--bg-3);
    border-radius: 2px;
    overflow: hidden;
  }
  .bar > span {
    display: block;
    height: 100%;
    background: var(--acc);
    border-radius: 2px;
    transition: width .4s cubic-bezier(.2,.7,.3,1);
  }

  @keyframes iron-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }
  .iron-in { animation: iron-in .3s cubic-bezier(.2,.7,.3,1) both; }

  a {
    color: inherit;
    text-decoration: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-track {
    background: var(--color-bg);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 2px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .page-enter {
    animation: fadeIn 0.2s ease forwards;
  }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
