import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useTaskStore } from './stores/taskStore'
import { useCalendarStore } from './stores/calendarStore'

// Expose stores for debugging
;(window as any).__stores = { task: useTaskStore, calendar: useCalendarStore }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)