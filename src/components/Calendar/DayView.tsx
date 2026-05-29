import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { useTimerStore } from '../../stores/timerStore'
import SlotTask, { TimeSlotDropZone } from './SlotTask'

interface Props {
  date: Date
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayView({ date }: Props) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const tasks = useTaskStore((s) => s.tasks)
  const allSlots = useCalendarStore((s) => s.slots)
  const slots = allSlots.filter((sl) => sl.date === dateStr)
  const startTimer = useTimerStore((s) => s.startTimer)
  const updateSlot = useCalendarStore((s) => s.updateSlot)

  const renderCount = useRef(0)
  renderCount.current++
  const [storeSnap, setStoreSnap] = useState({ total: 0, matching: 0 })
  useEffect(() => {
    setStoreSnap({ total: allSlots.length, matching: slots.length })
  }, [allSlots, slots.length])

  const getSlotsForHour = (hour: number) => {
    return slots.filter((s) => {
      const [startH, startM] = s.startTime.split(':').map(Number)
      const [endH, endM] = s.endTime.split(':').map(Number)
      const slotStart = startH * 60 + startM
      const slotEnd = endH * 60 + endM
      const hourStart = hour * 60
      const hourEnd = (hour + 1) * 60
      return slotStart < hourEnd && slotEnd > hourStart
    })
  }

  const handleStart = async (slotId: string, taskId: string, customStartTimestamp?: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const startDate = customStartTimestamp ? new Date(customStartTimestamp) : new Date()
    const startTimeStr = startDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
    await updateSlot(slotId, { actualStartTime: startTimeStr })
    startTimer(taskId, slotId, task.estimatedMinutes, customStartTimestamp)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Time labels row */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-1 text-[10px] text-gray-400 flex justify-between">
        <span>All-day / Timed</span>
        <span className="text-blue-500">R{renderCount.current} | S{storeSnap.total}/{storeSnap.matching}</span>
      </div>

      {HOURS.map((hour) => (
        <div key={hour} className="flex border-b border-gray-50">
          {/* Time label */}
          <div className="w-14 flex-shrink-0 text-right pr-2 pt-0.5">
            <span className="text-[10px] text-gray-400">
              {String(hour).padStart(2, '0')}:00
            </span>
          </div>

          {/* Slot content */}
          <div className="flex-1">
            <TimeSlotDropZone date={dateStr} hour={hour}>
              <div className="flex flex-col gap-0.5">
                {getSlotsForHour(hour).map((slot) => {
                  const task = tasks.find((t) => t.id === slot.taskId)
                  if (!task) return null

                  // Only render at the starting hour
                  const startH = parseInt(slot.startTime.split(':')[0])
                  if (startH !== hour) return null

                  return (
                    <SlotTask
                      key={slot.id}
                      slot={slot}
                      task={task}
                      onStart={(customStartTimestamp) => handleStart(slot.id, task.id, customStartTimestamp)}
                    />
                  )
                })}
              </div>
            </TimeSlotDropZone>
          </div>
        </div>
      ))}
    </div>
  )
}