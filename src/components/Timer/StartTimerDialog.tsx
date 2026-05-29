import { useState } from 'react'
import { Clock, Play, X } from 'lucide-react'

interface Props {
  taskName: string
  slotStartTime: string
  onConfirm: (customStartTimestamp: number) => void
  onCancel: () => void
}

function getDateForTime(timeStr: string): Date {
  const now = new Date()
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
  return d
}

function formatTimeForInput(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export default function StartTimerDialog({ taskName, slotStartTime, onConfirm, onCancel }: Props) {
  const now = new Date()
  const nowStr = formatTimeForInput(now)
  const [selectedTime, setSelectedTime] = useState(nowStr)

  const handleStart = () => {
    const [h, m] = selectedTime.split(':').map(Number)
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
    onConfirm(date.getTime())
  }

  const handleStartNow = () => {
    onConfirm(Date.now())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow-xl p-4 w-64 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">Start Timer</span>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-gray-500 truncate">{taskName}</p>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            Start time
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStartNow}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Play size={12} />
            Now
          </button>
          <button
            onClick={handleStart}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Clock size={12} />
            Set Time
          </button>
        </div>
      </div>
    </div>
  )
}