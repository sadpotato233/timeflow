import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { useTaskStore } from '../../stores/taskStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { useTimerStore } from '../../stores/timerStore'
import SlotTask, { TimeSlotDropZone } from './SlotTask'

interface Props {
  date: Date
}

const QUARTER_COUNT = 24 * 4 // 96 quarters = 15-min intervals

function quarterToTime(q: number): string {
  const h = Math.floor(q / 4)
  const m = (q % 4) * 15
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function isHourStart(q: number): boolean {
  return q % 4 === 0
}

function slotStartQuarter(startTime: string): number {
  const [h, m] = startTime.split(':').map(Number)
  return h * 4 + Math.floor(m / 15)
}

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

  // Get slots that overlap with a given quarter (15-min window)
  const getSlotsForQuarter = (quarter: number) => {
    return slots.filter((s) => {
      const [startH, startM] = s.startTime.split(':').map(Number)
      const [endH, endM] = s.endTime.split(':').map(Number)
      const slotStart = startH * 60 + startM
      const slotEnd = endH * 60 + endM
      const quarterStart = quarter * 15
      const quarterEnd = (quarter + 1) * 15
      return slotStart < quarterEnd && slotEnd > quarterStart
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
      <div className="sticky top-0 bg-white border-b border-gray-200 px-2 py-1 text-[10px] text-gray-400 flex justify-between">
        <span>All-day / Timed</span>
        <span className="text-blue-500">
          R{renderCount.current} | S{storeSnap.total}/{storeSnap.matching}
        </span>
      </div>

      {Array.from({ length: QUARTER_COUNT }, (_, q) => {
        const sTime = quarterToTime(q)
        const hourStart = isHourStart(q)
        return (
          <div key={q} className="flex border-b border-gray-50">
            {/* Time label */}
            <div className="w-14 flex-shrink-0 text-right pr-2 pt-px">
              {hourStart ? (
                <span className="text-[10px] text-gray-400">{sTime}</span>
              ) : (
                <span className="text-[9px] text-gray-300">{sTime}</span>
              )}
            </div>

            {/* Drop zone */}
            <div className="flex-1">
              <TimeSlotDropZone date={dateStr} startTime={sTime} isHourStart={hourStart}>
                <div className="flex flex-col gap-0.5">
                  {getSlotsForQuarter(q)
                    .filter((s) => slotStartQuarter(s.startTime) === q)
                    .map((slot) => {
                      const task = tasks.find((t) => t.id === slot.taskId)
                      if (!task) return null
                      return (
                        <SlotTask
                          key={slot.id}
                          slot={slot}
                          task={task}
                          onStart={(customStartTimestamp) =>
                            handleStart(slot.id, task.id, customStartTimestamp)
                          }
                        />
                      )
                    })}
                </div>
              </TimeSlotDropZone>
            </div>
          </div>
        )
      })}
    </div>
  )
}