import { createEvents, type EventAttributes } from 'ics'
import type { CalendarSlot } from '../types'
import { useTaskStore } from '../stores/taskStore'

function toUTCDate(dateStr: string, timeStr: string): Date {
  const d = new Date(`${dateStr}T${timeStr}:00`)
  return d
}

function dateToArray(d: Date): [number, number, number, number, number] {
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ]
}

export function exportSlotsToIcs(slots: CalendarSlot[]): string {
  const tasks = useTaskStore.getState().tasks
  const taskMap = new Map(tasks.map((t) => [t.id, t]))

  const events: EventAttributes[] = slots.map((slot) => {
    const task = taskMap.get(slot.taskId)
    const start = toUTCDate(slot.date, slot.startTime)
    const end = toUTCDate(
      slot.date,
      slot.actualEndTime || slot.endTime
    )
    return {
      title: `${task?.name || 'Untitled'} ${slot.actualEndTime ? '(Actual)' : ''}`,
      start: dateToArray(start),
      end: dateToArray(end),
      description: `Estimated: ${task?.estimatedMinutes || 0}min | Status: ${task?.status || 'unknown'}`,
    }
  })

  const { value } = createEvents(events)
  return value || ''
}

export function downloadIcsFile(slots: CalendarSlot[]) {
  const icsString = exportSlotsToIcs(slots)
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'timeflow-events.ics'
  a.click()
  URL.revokeObjectURL(url)
}