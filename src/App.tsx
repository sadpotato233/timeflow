import { useState, useEffect, Component, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { startOfWeek } from 'date-fns'
import { useTaskStore } from './stores/taskStore'
import { useCalendarStore } from './stores/calendarStore'
import type { CalendarView } from './types'

import Toolbar from './components/Toolbar/Toolbar'
import CalendarHeader from './components/Calendar/CalendarHeader'
import DayView from './components/Calendar/DayView'
import WeekView from './components/Calendar/WeekView'
import TaskTree from './components/Sidebar/TaskTree'
import ActiveTimerBar from './components/Timer/ActiveTimer'

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      const e = this.state.error
      const msg = e?.message || e?.toString() || JSON.stringify(e) || 'Unknown'
      const stack = e?.stack || ''
      return (
        this.props.fallback || (
          <div style={{ padding: 20, background: '#FEE2E2', color: '#DC2626', maxWidth: 700, margin: '20px auto', borderRadius: 8, fontFamily: 'monospace', fontSize: 13 }}>
            <strong>Component Error:</strong>
            <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg}</pre>
            {stack && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', color: '#991B1B' }}>Stack Trace</summary>
                <pre style={{ marginTop: 4, fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 300, overflow: 'auto' }}>{stack}</pre>
              </details>
            )}
            <button
              style={{ marginTop: 12, padding: '6px 16px', cursor: 'pointer', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6 }}
              onClick={() => this.setState({ hasError: false })}
            >
              Retry
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export default function App() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const [view, setView] = useState<CalendarView>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeDrag, setActiveDrag] = useState<{
    taskId: string
    taskName: string
  } | null>(null)

  const loadTasks = useTaskStore((s) => s.loadTasks)
  const loadSlots = useCalendarStore((s) => s.loadSlots)
  const placeTask = useCalendarStore((s) => s.placeTask)
  const tasks = useTaskStore((s) => s.tasks)

  useEffect(() => {
    loadTasks()
    loadSlots()
  }, [loadTasks, loadSlots])

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })

  const handleDragEnd = (event: any) => {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.data.current?.taskId
    const estimatedMinutes = active.data.current?.estimatedMinutes
    const dropDate = over.data.current?.date
    const dropStartTime = over.data.current?.startTime

    if (taskId && dropDate && dropStartTime && estimatedMinutes) {
      placeTask(taskId, dropDate, dropStartTime, estimatedMinutes)
    }
  }

  const handleDragStart = (event: any) => {
    const taskId = event.active.data.current?.taskId
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setActiveDrag({ taskId: task.id, taskName: task.name })
    }
  }

  return (
    <ErrorBoundary>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={pointerWithin}
      >
        <div className="h-screen flex flex-col overflow-hidden bg-white">
          <Toolbar />

          <div className="flex flex-1 overflow-hidden">
            <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
              <TaskTree />
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
              <CalendarHeader
                view={view}
                setView={setView}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />

              {view === 'day' ? (
                <DayView date={selectedDate} />
              ) : (
                <WeekView weekStart={weekStart} />
              )}
            </main>
          </div>

          <ActiveTimerBar />
        </div>

        <DragOverlay>
          {activeDrag ? (
            <div className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded shadow-lg opacity-90">
              {activeDrag.taskName}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ErrorBoundary>
  )
}