import { format, addDays } from 'date-fns'
import { useTaskStore } from '../../stores/taskStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { useTimerStore } from '../../stores/timerStore'
import SlotTask, { TimeSlotDropZone } from './SlotTask'

interface Props {
  weekStart: Date
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function WeekView({ weekStart }: Props) {
  const tasks = useTaskStore((s) => s.tasks)
  const slots = useCalendarStore((s) => s.slots)
  const startTimer = useTimerStore((s) => s.startTimer)
  const updateSlot = useCalendarStore((s) => s.updateSlot)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getSlotsForDayHour = (dateStr: string, hour: number) => {
    return slots.filter((s) => {
      if (s.date !== dateStr) return false
      const [startH, startM] = s.startTime.split(':').map(Number)
      const [endH, endM] = s.endTime.split(':').map(Number)
      return (startH * 60 + startM) < (hour + 1) * 60 && (endH * 60 + endM) > hour * 60
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
      {HOURS.map((hour) => (
        <div key={hour} className="flex border-b border-gray-50">
          <div className="w-14 flex-shrink-0 text-right pr-2 pt-0.5">
            <span className="text-[10px] text-gray-400">
              {String(hour).padStart(2, '0')}:00
            </span>
          </div>

          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            return (
              <div key={dateStr} className="flex-1 border-l border-gray-50">
                <TimeSlotDropZone date={dateStr} hour={hour}>
                  <div className="flex flex-col gap-0.5">
                    {getSlotsForDayHour(dateStr, hour)
                      .filter((s) => parseInt(s.startTime.split(':')[0]) === hour)
                      .map((slot) => {
                        const task = tasks.find((t) => t.id === slot.taskId)
                        if (!task) return null
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
            )
          })}
        </div>
      ))}
    </div>
  )
}