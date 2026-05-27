import type { CalendarSlot } from '../types'
import { useTaskStore } from '../stores/taskStore'
import { useSyncStore } from '../stores/syncStore'

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

function toRFC3339(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00`
}

export async function syncSlotToGoogle(slot: CalendarSlot): Promise<void> {
  const token = useSyncStore.getState().googleToken
  if (!token) throw new Error('Not authenticated')

  const task = useTaskStore.getState().tasks.find((t) => t.id === slot.taskId)

  const event = {
    summary: task?.name || 'Untitled Task',
    description: `Estimated: ${task?.estimatedMinutes || 0} min`,
    start: {
      dateTime: toRFC3339(slot.date, slot.actualStartTime || slot.startTime),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: toRFC3339(slot.date, slot.actualEndTime || slot.endTime),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }

  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )

  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${res.status}`)
  }
}

export async function deleteSlotFromGoogle(eventId: string): Promise<void> {
  const token = useSyncStore.getState().googleToken
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  if (!res.ok && res.status !== 410) {
    throw new Error(`Google Calendar API error: ${res.status}`)
  }
}