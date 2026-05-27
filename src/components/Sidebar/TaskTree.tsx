import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'

export default function TaskTree() {
  const tasks = useTaskStore((s) => s.tasks)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const rootTasks = tasks.filter((t) => !t.parentId)
  const filtered = rootTasks.filter((t) => {
    const matchName = t.name.toLowerCase().includes(filter.toLowerCase())
    const matchStatus =
      statusFilter === 'all' || t.status === statusFilter
    return matchName && matchStatus
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Tasks</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + New
          </button>
        </div>

        {showForm && <TaskForm onClose={() => setShowForm(false)} />}

        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {['all', 'todo', 'completed-on-time', 'completed-overtime', 'uncompleted'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  statusFilter === s
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'All' : s.replace(/-/g, ' ')}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            No tasks yet. Click "+ New" to create one.
          </p>
        ) : (
          filtered.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}