import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Play, Check, X, Clock } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { useTimerStore } from '../../stores/timerStore'
import StartTimerDialog from '../Timer/StartTimerDialog'
import type { CalendarSlot, Task } from '../../types'

interface Props {
  slot: CalendarSlot
  task: Task
  onStart: (customStartTimestamp?: number) => void
}

const STATUS_BG: Record<string, string> = {
  todo: 'bg-blue-100 border-l-4 border-blue-400',
  'completed-on-time': 'bg-green-100 border-l-4 border-green-400',
  'completed-overtime': 'bg-orange-100 border-l-4 border-orange-400',
  uncompleted: 'bg-gray-100 border-l-4 border-gray-300',
}

export default function SlotTask({ slot, task, onStart }: Props) {
  const [showStartDialog, setShowStartDialog] = useState(false)
  const setTaskStatus = useTaskStore((s) => s.setTaskStatus)
  const updateSlot = useCalendarStore((s) => s.updateSlot)
  const overtimedTasks = useTimerStore((s) => s.overtimedTasks)
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const isOvertimed = overtimedTasks.has(task.id)
  const isActive = activeTimer?.slotId === slot.id

  const handleComplete = async (onTime: boolean) => {
    const now = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const status = onTime ? 'completed-on-time' : 'completed-overtime'
    await setTaskStatus(task.id, status)
    await updateSlot(slot.id, { actualEndTime: now })
  }

  const handleSkip = async () => {
    await setTaskStatus(task.id, 'uncompleted')
  }

  return (
    <div
      className={`text-[10px] p-1 rounded ${STATUS_BG[task.status]} ${isOvertimed ? 'animate-pulse ring-2 ring-orange-300' : ''} ${isActive ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{task.name}</span>
        {task.status === 'todo' && (
          <div className="flex gap-0.5">
            <button
              onClick={() => setShowStartDialog(true)}
              className="p-0.5 rounded bg-green-500 text-white hover:bg-green-600"
              title="Start"
            >
              <Play size={10} />
            </button>
            <button
              onClick={() => handleComplete(true)}
              className="p-0.5 rounded bg-blue-500 text-white hover:bg-blue-600"
              title="Mark done (on time)"
            >
              <Check size={10} />
            </button>
            <button
              onClick={handleSkip}
              className="p-0.5 rounded bg-gray-400 text-white hover:bg-gray-500"
              title="Skip"
            >
              <X size={10} />
            </button>
          </div>
        )}
        {task.status === 'completed-on-time' && (
          <span className="text-green-600 text-[9px]">✓ On time</span>
        )}
        {task.status === 'completed-overtime' && (
          <span className="text-orange-600 text-[9px]">⌛ Late</span>
        )}
        {task.status === 'uncompleted' && (
          <span className="text-gray-400 text-[9px]">Skipped</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-gray-500 mt-0.5">
        <Clock size={8} />
        <span>
          {slot.startTime} – {slot.actualEndTime || slot.endTime}
          {slot.actualEndTime && slot.actualEndTime !== slot.endTime && (
            <span className="text-orange-500 ml-0.5">
              (planned {slot.startTime}–{slot.endTime})
            </span>
          )}
        </span>
      </div>

      {showStartDialog && (
        <StartTimerDialog
          taskName={task.name}
          slotStartTime={slot.startTime}
          onConfirm={(customStartTimestamp) => {
            setShowStartDialog(false)
            onStart(customStartTimestamp)
          }}
          onCancel={() => setShowStartDialog(false)}
        />
      )}
    </div>
  )
}

// Container component used in day/week views
interface SlotContainerProps {
  date: string
  hour: number
  children?: React.ReactNode
}

export function TimeSlotDropZone({ date, hour, children }: SlotContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${date}-${hour}`,
    data: { date, startTime: `${String(hour).padStart(2, '0')}:00` },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[48px] border-t border-gray-100 p-0.5 ${isOver ? 'bg-blue-50' : ''} transition-colors`}
    >
      {children}
    </div>
  )
}