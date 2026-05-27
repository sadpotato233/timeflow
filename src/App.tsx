import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { startOfWeek } from 'date-fns'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useTaskStore } from './stores/taskStore'
import { useCalendarStore } from './stores/calendarStore'
import type { CalendarView } from './types'

import Toolbar from './components/Toolbar/Toolbar'
import CalendarHeader from './components/Calendar/CalendarHeader'
import DayView from './components/Calendar/DayView'
import WeekView from './components/Calendar/WeekView'
import TaskTree from './components/Sidebar/TaskTree'
import ActiveTimerBar from './components/Timer/ActiveTimer'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
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

  const content = (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Toolbar */}
        <Toolbar />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
            <TaskTree />
          </aside>

          {/* Calendar */}
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

        {/* Timer bar */}
        <ActiveTimerBar />
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDrag ? (
          <div className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded shadow-lg opacity-90">
            {activeDrag.taskName}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )

  // Only wrap in GoogleOAuthProvider if we have a client ID
  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {content}
      </GoogleOAuthProvider>
    )
  }

  return content
}