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
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-body);
    min-height: 100dvh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  input, textarea, select, button {
    font-family: var(--font-body);
    font-size: 16px;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
  }

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
