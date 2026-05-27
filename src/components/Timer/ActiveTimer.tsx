import { useEffect, useRef } from 'react'
import { Play, Pause, Check, X, Timer as TimerIcon } from 'lucide-react'
import { useTimerStore } from '../../stores/timerStore'
import { useTaskStore } from '../../stores/taskStore'
import { useCalendarStore } from '../../stores/calendarStore'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ActiveTimerBar() {
  const { activeTimer, tick, pauseTimer, resumeTimer, stopTimer } = useTimerStore()
  const setTaskStatus = useTaskStore((s) => s.setTaskStatus)
  const updateSlot = useCalendarStore((s) => s.updateSlot)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    if (activeTimer && activeTimer.type !== 'paused') {
      timerRef.current = setInterval(tick, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeTimer?.type, activeTimer?.slotId, tick])

  if (!activeTimer) return null

  const task = useTaskStore.getState().tasks.find(
    (t) => t.id === activeTimer.taskId
  )
  const isCountdown = activeTimer.type === 'countdown'
  const remainingSeconds = Math.max(
    0,
    activeTimer.totalEstimatedSeconds - activeTimer.elapsedSeconds
  )
  const displayTime = isCountdown ? remainingSeconds : activeTimer.elapsedSeconds

  const handleComplete = async (onTime: boolean) => {
    const now = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const status = onTime ? 'completed-on-time' : 'completed-overtime'
    await setTaskStatus(activeTimer.taskId, status)
    await updateSlot(activeTimer.slotId, { actualEndTime: now })
    stopTimer()
  }

  const handleSkip = async () => {
    await setTaskStatus(activeTimer.taskId, 'uncompleted')
    stopTimer()
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg ${
        isCountdown ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white animate-pulse'
      }`}
    >
      <TimerIcon size={16} className="animate-spin-slow" />
      <span className="text-xs font-medium truncate max-w-[120px]">
        {task?.name || 'Task'}
      </span>
      <span className="text-lg font-mono font-bold tabular-nums min-w-[60px] text-center">
        {isCountdown ? '-' : '+'}
        {formatTime(displayTime)}
      </span>

      {activeTimer.type === 'paused' ? (
        <button onClick={resumeTimer} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
          <Play size={14} />
        </button>
      ) : (
        <button onClick={pauseTimer} className="p-1 rounded-full bg-white/20 hover:bg-white/30">
          <Pause size={14} />
        </button>
      )}

      <button
        onClick={() => handleComplete(!activeTimer.type.includes('countup') || activeTimer.elapsedSeconds <= activeTimer.totalEstimatedSeconds)}
        className="p-1 rounded-full bg-white/20 hover:bg-green-400 transition-colors"
        title="Complete"
      >
        <Check size={14} />
      </button>
      <button
        onClick={handleSkip}
        className="p-1 rounded-full bg-white/20 hover:bg-red-400 transition-colors"
        title="Skip"
      >
        <X size={14} />
      </button>
    </div>
  )
}