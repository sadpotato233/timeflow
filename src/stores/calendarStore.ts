import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { CalendarSlot } from '../types'
import { db } from '../db/database'

interface CalendarStore {
  slots: CalendarSlot[]
  loaded: boolean
  loadSlots: () => Promise<void>
  placeTask: (
    taskId: string,
    date: string,
    startTime: string,
    estimatedMinutes: number
  ) => CalendarSlot
  removeSlot: (id: string) => Promise<void>
  updateSlot: (id: string, patch: Partial<CalendarSlot>) => Promise<void>
  getSlotsByDate: (date: string) => CalendarSlot[]
}

function calcEndTime(startTime: string, minutes: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  slots: [],
  loaded: false,

  loadSlots: async () => {
    const slots = await db.slots.toArray()
    set({ slots, loaded: true })
  },

  placeTask: (taskId, date, startTime, estimatedMinutes) => {
    const endTime = calcEndTime(startTime, estimatedMinutes)
    const slot: CalendarSlot = {
      id: uuidv4(),
      taskId,
      date,
      startTime,
      endTime,
      actualStartTime: null,
      actualEndTime: null,
    }
    // Sync store update FIRST — guarantees React re-render
    set({ slots: [...get().slots, slot] })
    // Persist to DB as fire-and-forget
    db.slots.add(slot).catch((e) => console.error('[placeTask] DB write failed:', e))
    return slot
  },

  removeSlot: async (id) => {
    await db.slots.delete(id)
    set({ slots: get().slots.filter((s) => s.id !== id) })
  },

  updateSlot: async (id, patch) => {
    await db.slots.update(id, patch)
    set({
      slots: get().slots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  },

  getSlotsByDate: (date) => {
    return get().slots.filter((s) => s.date === date)
  },
}))