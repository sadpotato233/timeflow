import { create } from 'zustand'
import type { ActiveTimer, TimerType } from '../types'

interface TimerStore {
  activeTimer: ActiveTimer | null
  overtimedTasks: Set<string> // taskIds whose countdown reached zero
  startTimer: (taskId: string, slotId: string, estimatedMinutes: number, customStartTimestamp?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  tick: () => void // called every second to update elapsed
  clearOvertime: (taskId: string) => void
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  activeTimer: null,
  overtimedTasks: new Set(),

  startTimer: (taskId, slotId, estimatedMinutes, customStartTimestamp) => {
    const startTimestamp = customStartTimestamp ?? Date.now()
    const preElapsed = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000))
    set({
      activeTimer: {
        taskId,
        slotId,
        type: preElapsed >= estimatedMinutes * 60 ? 'countup' : 'countdown',
        elapsedSeconds: preElapsed,
        totalEstimatedSeconds: estimatedMinutes * 60,
        startTimestamp,
      },
    })
  },

  pauseTimer: () => {
    const { activeTimer } = get()
    if (!activeTimer || activeTimer.type === 'paused') return
    set({
      activeTimer: { ...activeTimer, type: 'paused' },
    })
  },

  resumeTimer: () => {
    const { activeTimer } = get()
    if (!activeTimer || activeTimer.type !== 'paused') return
    set({
      activeTimer: { ...activeTimer, type: activeTimer.elapsedSeconds >= activeTimer.totalEstimatedSeconds ? ('countup' as TimerType) : ('countdown' as TimerType), startTimestamp: Date.now() - activeTimer.elapsedSeconds * 1000 },
    })
  },

  stopTimer: () => {
    set({ activeTimer: null })
  },

  tick: () => {
    const { activeTimer } = get()
    if (!activeTimer || activeTimer.type === 'paused') return

    const elapsed = Math.floor((Date.now() - activeTimer.startTimestamp) / 1000)
    const newTimer = { ...activeTimer, elapsedSeconds: elapsed }

    // Switch from countdown to countup when time runs out
    if (
      activeTimer.type === 'countdown' &&
      elapsed >= activeTimer.totalEstimatedSeconds
    ) {
      newTimer.type = 'countup'
      // Mark as overtimed
      const overtimed = new Set(get().overtimedTasks)
      overtimed.add(activeTimer.taskId)
      set({ activeTimer: newTimer, overtimedTasks: overtimed })
      return
    }

    set({ activeTimer: newTimer })
  },

  clearOvertime: (taskId) => {
    const overtimed = new Set(get().overtimedTasks)
    overtimed.delete(taskId)
    set({ overtimedTasks: overtimed })
  },
}))