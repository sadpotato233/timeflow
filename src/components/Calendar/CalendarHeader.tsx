import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek } from 'date-fns'
import type { CalendarView } from '../../types'

interface Props {
  view: CalendarView
  setView: (v: CalendarView) => void
  selectedDate: Date
  setSelectedDate: (d: Date) => void
}

export default function CalendarHeader({
  view,
  setView,
  selectedDate,
  setSelectedDate,
}: Props) {
  const navBack = () => {
    if (view === 'day') setSelectedDate(subDays(selectedDate, 1))
    else setSelectedDate(subWeeks(selectedDate, 1))
  }

  const navForward = () => {
    if (view === 'day') setSelectedDate(addDays(selectedDate, 1))
    else setSelectedDate(addWeeks(selectedDate, 1))
  }

  const goToday = () => setSelectedDate(new Date())

  const headerText =
    view === 'day'
      ? format(selectedDate, 'EEEE, MMMM d, yyyy')
      : (() => {
          const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
          const end = addDays(start, 6)
          return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
        })()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <button
          onClick={navBack}
          className="p-1 rounded hover:bg-gray-100 text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goToday}
          className="px-2 py-0.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded"
        >
          Today
        </button>
        <button
          onClick={navForward}
          className="p-1 rounded hover:bg-gray-100 text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
        <h2 className="text-sm font-semibold text-gray-800 ml-2">{headerText}</h2>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => setView('day')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            view === 'day' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => setView('week')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            view === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Week
        </button>
      </div>
    </div>
  )
}