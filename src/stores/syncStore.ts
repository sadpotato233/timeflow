import { create } from 'zustand'

interface SyncStore {
  googleToken: string | null
  setGoogleToken: (token: string | null) => void
  isConnected: boolean
}

export const useSyncStore = create<SyncStore>((set) => ({
  googleToken: null,
  isConnected: false,

  setGoogleToken: (token) =>
    set({ googleToken: token, isConnected: !!token }),
}))