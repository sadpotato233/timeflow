import { format, addDays } from 'date-fns'
import { useTaskStore } from '../../stores/taskStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { useTimerStore } from '../../stores/timerStore'
import SlotTask, { TimeSlotDropZone } from './SlotTask'

interface Props {
  weekStart: Date
}

const QUARTER_COUNT = 24 * 4

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

export default function WeekView({ weekStart }: Props) {
  const tasks = useTaskStore((s) => s.tasks)
  const slots = useCalendarStore((s) => s.slots)
  const startTimer = useTimerStore((s) => s.startTimer)
  const updateSlot = useCalendarStore((s) => s.updateSlot)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getSlotsForDayQuarter = (dateStr: string, quarter: number) => {
    return slots.filter((s) => {
      if (s.date !== dateStr) return false
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
      {/* Day headers */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex">
        <div className="w-14 flex-shrink-0" />
        {days.map((day) => {
          const isToday =
            format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
          return (
            <div
              key={day.toISOString()}
              className={`flex-1 text-center py-2 border-l border-gray-100 ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-[10px] text-gray-400">
                {format(day, 'EEE')}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isToday ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time rows */}
      {Array.from({ length: QUARTER_COUNT }, (_, q) => {
        const sTime = quarterToTime(q)
        const hourStart = isHourStart(q)
        return (
          <div key={q} className="flex border-b border-gray-50">
            <div className="w-14 flex-shrink-0 text-right pr-2 pt-px">
              {hourStart ? (
                <span className="text-[10px] text-gray-400">{sTime}</span>
              ) : (
                <span className="text-[9px] text-gray-300">{sTime}</span>
              )}
            </div>

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              return (
                <div key={dateStr} className="flex-1 border-l border-gray-50">
                  <TimeSlotDropZone date={dateStr} startTime={sTime} isHourStart={hourStart}>
                    <div className="flex flex-col gap-0.5">
                      {getSlotsForDayQuarter(dateStr, q)
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
              )
            })}
          </div>
        )
      })}
    </div>
  )
}