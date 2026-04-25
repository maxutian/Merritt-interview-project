import React, { createContext, useContext, ReactNode } from 'react'
import { AppConfig } from '@/types'
import { addDaysToLocalDate, formatLocalDate } from '@/lib/date'

interface AppContextValue {
  config: AppConfig
}

const today = new Date()

const defaultConfig: AppConfig = {
  dateRangeStart: formatLocalDate(today),
  dateRangeEnd: formatLocalDate(addDaysToLocalDate(today, 30)),
  columnWidthPx: 48,
  bookingHeaderBackground: "#e8f4fc"
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const value: AppContextValue = {
    config: defaultConfig,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
