import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Task, TaskStatus } from '../types'
import { db } from '../db/database'

interface TaskStore {
  tasks: Task[]
  loaded: boolean
  loadTasks: () => Promise<void>
  addTask: (data: Omit<Task, 'id' | 'status' | 'createdAt'>) => Promise<Task>
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loaded: false,

  loadTasks: async () => {
    const tasks = await db.tasks.toArray()
    set({ tasks, loaded: true })
  },

  addTask: async (data) => {
    const task: Task = {
      ...data,
      id: uuidv4(),
      status: 'todo',
      createdAt: new Date().toISOString(),
    }
    await db.tasks.add(task)
    set({ tasks: [...get().tasks, task] })
    return task
  },

  updateTask: async (id, patch) => {
    await db.tasks.update(id, patch)
    set({
      tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  },

  deleteTask: async (id) => {
    // Delete task and all its sub-tasks
    const subIds = get().tasks.filter((t) => t.parentId === id).map((t) => t.id)
    const allIds = [id, ...subIds]
    await db.tasks.bulkDelete(allIds)
    set({ tasks: get().tasks.filter((t) => !allIds.includes(t.id)) })
  },

  setTaskStatus: async (id, status) => {
    await db.tasks.update(id, { status })
    set({
      tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })
  },
}))