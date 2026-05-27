import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'

interface Props {
  parentId?: string | null
  onClose?: () => void
}

export default function TaskForm({ parentId = null, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask)
  const [name, setName] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [tags, setTags] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addTask({
      name: name.trim(),
      estimatedMinutes,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      deadline: deadline || null,
      parentId,
    })
    setName('')
    setEstimatedMinutes(30)
    setTags('')
    setDeadline('')
    onClose?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border border-gray-200 rounded-lg bg-white space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {parentId ? 'Add Sub-Task' : 'New Task'}
        </span>
        {onClose && (
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Task name"
        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        autoFocus
      />

      <div className="flex gap-2">
        <select
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>1 hour</option>
          <option value={90}>1.5 hours</option>
          <option value={120}>2 hours</option>
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Deadline"
        />
      </div>

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
      >
        <Plus size={12} />
        Add Task
      </button>
    </form>
  )
}