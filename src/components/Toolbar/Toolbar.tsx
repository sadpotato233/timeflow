import { Download } from 'lucide-react'
import { useCalendarStore } from '../../stores/calendarStore'
import { downloadIcsFile } from '../../utils/icsExport'

export default function Toolbar() {
  const slots = useCalendarStore((s) => s.slots)

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
      <h1 className="text-sm font-bold text-blue-600 mr-2">🦐 TimeFlow</h1>
      <button
        onClick={() => downloadIcsFile(slots)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        <Download size={12} />
        Export .ics
      </button>
    </div>
  )
}