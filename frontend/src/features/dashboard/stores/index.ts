import { createStore, useStore } from 'zustand'
import type { CategoryStatMode, ManagerRankingMode } from '../entities'

export const pageSizes = [10, 25, 50] as const

export type PageSize = (typeof pageSizes)[number]

export interface DashboardUiState {
  periodFrom: string
  periodTo: string
  rankingMode: ManagerRankingMode
  categoryMode: CategoryStatMode
  managerId: string
  rankingSkip: number
  rankingTake: PageSize
  categorySkip: number
  categoryTake: PageSize
  salesSkip: number
  salesTake: PageSize
  setPeriod: (periodFrom: string, periodTo: string) => void
  setRankingMode: (rankingMode: ManagerRankingMode) => void
  setCategoryMode: (categoryMode: CategoryStatMode) => void
  setManagerId: (managerId: string) => void
  setRankingPage: (rankingSkip: number, rankingTake: number) => void
  setCategoryPage: (categorySkip: number, categoryTake: number) => void
  setSalesPage: (salesSkip: number, salesTake: number) => void
}

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initialPeriod() {
  const today = new Date()
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
  return {
    periodFrom: localDate(from),
    periodTo: localDate(today),
  }
}

function isPageSize(value: number): value is PageSize {
  return value === 10 || value === 25 || value === 50
}

function pageUpdate(currentTake: PageSize, skip: number, take: number) {
  if (!isPageSize(take)) {
    return null
  }

  return {
    take,
    skip: currentTake === take ? skip : 0,
  }
}

const period = initialPeriod()

export const dashboardStore = createStore<DashboardUiState>()((set) => ({
  periodFrom: period.periodFrom,
  periodTo: period.periodTo,
  rankingMode: 0,
  categoryMode: 0,
  managerId: '',
  rankingSkip: 0,
  rankingTake: 10,
  categorySkip: 0,
  categoryTake: 10,
  salesSkip: 0,
  salesTake: 10,
  setPeriod: (periodFrom, periodTo) => set({ periodFrom, periodTo }),
  setRankingMode: (rankingMode) => set({ rankingMode }),
  setCategoryMode: (categoryMode) => set({ categoryMode }),
  setManagerId: (managerId) => set({ managerId }),
  setRankingPage: (rankingSkip, rankingTake) =>
    set((state) => {
      const next = pageUpdate(state.rankingTake, rankingSkip, rankingTake)
      return next === null ? state : { rankingSkip: next.skip, rankingTake: next.take }
    }),
  setCategoryPage: (categorySkip, categoryTake) =>
    set((state) => {
      const next = pageUpdate(state.categoryTake, categorySkip, categoryTake)
      return next === null ? state : { categorySkip: next.skip, categoryTake: next.take }
    }),
  setSalesPage: (salesSkip, salesTake) =>
    set((state) => {
      const next = pageUpdate(state.salesTake, salesSkip, salesTake)
      return next === null ? state : { salesSkip: next.skip, salesTake: next.take }
    }),
}))

export function useDashboardStore<T>(selector: (state: DashboardUiState) => T): T {
  return useStore(dashboardStore, selector)
}
