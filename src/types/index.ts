export type TaskStatus =
  | 'todo'
  | 'completed-on-time'
  | 'completed-overtime'
  | 'uncompleted'

export interface Task {
  id: string
  name: string
  estimatedMinutes: number
  tags: string[]
  deadline: string | null // ISO date string
  parentId: string | null
  status: TaskStatus
  createdAt: string
}

export interface CalendarSlot {
  id: string
  taskId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm — planned end
  actualStartTime: string | null
  actualEndTime: string | null
}

export type TimerType = 'countdown' | 'countup' | 'paused'

export interface ActiveTimer {
  taskId: string
  slotId: string
  type: TimerType
  elapsedSeconds: number
  totalEstimatedSeconds: number
  startTimestamp: number
}

export type CalendarView = 'day' | 'week'