import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown, Plus, Clock, Tag, Calendar, Trash2 } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import type { Task, TaskStatus } from '../../types'
import TaskForm from './TaskForm'

interface Props {
  task: Task
  depth?: number
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-blue-100 text-blue-700 border-blue-300',
  'completed-on-time': 'bg-green-100 text-green-700 border-green-300',
  'completed-overtime': 'bg-orange-100 text-orange-700 border-orange-300',
  uncompleted: 'bg-gray-100 text-gray-500 border-gray-300',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'completed-on-time': 'Done ✓',
  'completed-overtime': 'Done (late)',
  uncompleted: 'Skipped',
}

export default function TaskItem({ task, depth = 0 }: Props) {
  const { tasks, deleteTask } = useTaskStore()
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const subTasks = tasks.filter((t) => t.parentId === task.id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id, estimatedMinutes: task.estimatedMinutes },
    disabled: task.status !== 'todo',
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 100 }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        className={`flex items-center gap-1.5 px-2 py-2 border rounded-md mb-1 ${STATUS_COLORS[task.status]} ${task.status === 'todo' ? 'cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow' : 'opacity-80'}`}
      >
        {task.status === 'todo' && (
          <button {...listeners} {...attributes} className="text-gray-400 hover:text-gray-600">
            <GripVertical size={14} />
          </button>
        )}

        {subTasks.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-500">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{task.name}</div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
            <span className="flex items-center gap-0.5">
              <Clock size={10} /> {task.estimatedMinutes}min
            </span>
            {task.tags.length > 0 && (
              <span className="flex items-center gap-0.5">
                <Tag size={10} /> {task.tags.join(', ')}
              </span>
            )}
            {task.deadline && (
              <span className="flex items-center gap-0.5">
                <Calendar size={10} /> {task.deadline}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium">{STATUS_LABELS[task.status]}</span>
          {subTasks.length > 0 && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-0.5 text-gray-400 hover:text-blue-500 rounded"
              title="Add sub-task"
            >
              <Plus size={12} />
            </button>
          )}
          <button
            onClick={() => deleteTask(task.id)}
            className="p-0.5 text-gray-400 hover:text-red-500 rounded"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {showForm && (
        <div className="ml-4 mb-1">
          <TaskForm parentId={task.id} onClose={() => setShowForm(false)} />
        </div>
      )}

      {expanded && subTasks.map((st) => (
        <div key={st.id} className="ml-4">
          <TaskItem task={st} depth={depth + 1} />
        </div>
      ))}
    </div>
  )
}