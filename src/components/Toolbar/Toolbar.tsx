import { Download, Link, Unlink } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { useCalendarStore } from '../../stores/calendarStore'
import { useSyncStore } from '../../stores/syncStore'
import { downloadIcsFile } from '../../utils/icsExport'
import { syncSlotToGoogle } from '../../utils/googleCalendar'

export default function Toolbar() {
  const slots = useCalendarStore((s) => s.slots)
  const { isConnected, setGoogleToken } = useSyncStore()

  const login = useGoogleLogin({
    onSuccess: (res) => setGoogleToken(res.access_token),
    onError: () => console.error('Google login failed'),
    scope: 'https://www.googleapis.com/auth/calendar.events',
  })

  const handleSyncAll = async () => {
    for (const slot of slots) {
      try {
        await syncSlotToGoogle(slot)
      } catch (e) {
        console.error('Sync failed for slot', slot.id, e)
      }
    }
    alert('Synced to Google Calendar!')
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
      <button
        onClick={() => downloadIcsFile(slots)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        <Download size={12} />
        Export .ics
      </button>

      {isConnected ? (
        <>
          <button
            onClick={handleSyncAll}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
          >
            <Link size={12} />
            Sync to Google
          </button>
          <button
            onClick={() => setGoogleToken(null)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
          >
            <Unlink size={12} />
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => login()}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
        >
          <Link size={12} />
          Connect Google
        </button>
      )}
    </div>
  )
}