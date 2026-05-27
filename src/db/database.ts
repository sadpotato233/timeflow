import Dexie, { type Table } from 'dexie'
import type { Task, CalendarSlot } from '../types'

export class TimeFlowDB extends Dexie {
  tasks!: Table<Task, string>
  slots!: Table<CalendarSlot, string>

  constructor() {
    super('timeflow')
    this.version(1).stores({
      tasks: 'id, parentId, status, deadline',
      slots: 'id, taskId, date',
    })
  }
}

export const db = new TimeFlowDB()