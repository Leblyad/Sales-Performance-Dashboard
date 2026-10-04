import { createStore, useStore } from 'zustand'
import type { CategoryStatMode, KpiCardsDto, ManagerRankingMode, ManagerRankingPageDto } from '../entities'

export const pageSizes = [10, 25, 50] as const

export type PageSize = (typeof pageSizes)[number]

export const periodPresets = [
  { kind: 'today', label: 'Сегодня' },
  { kind: 'sevenDays', label: '7 дней' },
  { kind: 'thirtyDays', label: '30 дней' },
  { kind: 'thisMonth', label: 'Этот месяц' },
  { kind: 'lastMonth', label: 'Прошлый месяц' },
] as const

export type PeriodPreset = (typeof periodPresets)[number]['kind']
export type PeriodKind = PeriodPreset | 'custom'

export function periodKey(periodFrom: string, periodTo: string) {
  return `${periodFrom}|${periodTo}`
}

export function rankingKey(mode: ManagerRankingMode, skip: number, take: number) {
  return `${mode}|${skip}|${take}`
}

export interface DashboardUiState {
  periodKind: PeriodKind
  periodFrom: string
  periodTo: string
  kpiByPeriod: Record<string, KpiCardsDto>
  rankingByQuery: Record<string, ManagerRankingPageDto>
  categoryMode: CategoryStatMode
  managerId: string
  categorySkip: number
  categoryTake: PageSize
  salesSkip: number
  salesTake: PageSize
  setPeriodPreset: (kind: PeriodPreset) => void
  setCustomPeriod: (periodFrom: string, periodTo: string) => void
  rememberKpi: (periodFrom: string, periodTo: string, cards: KpiCardsDto) => void
  rememberRanking: (mode: ManagerRankingMode, skip: number, take: number, page: ManagerRankingPageDto) => void
  setCategoryMode: (categoryMode: CategoryStatMode) => void
  setManagerId: (managerId: string) => void
  setCategoryPage: (categorySkip: number, categoryTake: number) => void
  setSalesPage: (salesSkip: number, salesTake: number) => void
}

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function periodRange(kind: PeriodPreset, today = new Date()) {
  const end = localDate(today)
  if (kind === 'today') {
    return { periodFrom: end, periodTo: end }
  }

  if (kind === 'sevenDays') {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
    return { periodFrom: localDate(start), periodTo: end }
  }

  if (kind === 'thirtyDays') {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
    return { periodFrom: localDate(start), periodTo: end }
  }

  if (kind === 'thisMonth') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { periodFrom: localDate(start), periodTo: localDate(last) }
  }

  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const last = new Date(today.getFullYear(), today.getMonth(), 0)
  return { periodFrom: localDate(start), periodTo: localDate(last) }
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

const period = periodRange('sevenDays')

export const dashboardStore = createStore<DashboardUiState>()((set) => ({
  periodKind: 'sevenDays',
  periodFrom: period.periodFrom,
  periodTo: period.periodTo,
  kpiByPeriod: {},
  rankingByQuery: {},
  categoryMode: 0,
  managerId: '',
  categorySkip: 0,
  categoryTake: 10,
  salesSkip: 0,
  salesTake: 10,
  setPeriodPreset: (kind) => set({ periodKind: kind, ...periodRange(kind) }),
  setCustomPeriod: (periodFrom, periodTo) => set({ periodKind: 'custom', periodFrom, periodTo }),
  rememberKpi: (periodFrom, periodTo, cards) =>
    set((state) => {
      const key = periodKey(periodFrom, periodTo)
      if (state.kpiByPeriod[key]) {
        return state
      }

      return { kpiByPeriod: { ...state.kpiByPeriod, [key]: cards } }
    }),
  rememberRanking: (mode, skip, take, page) =>
    set((state) => {
      const key = rankingKey(mode, skip, take)
      if (state.rankingByQuery[key]) {
        return state
      }

      return { rankingByQuery: { ...state.rankingByQuery, [key]: page } }
    }),
  setCategoryMode: (categoryMode) => set({ categoryMode }),
  setManagerId: (managerId) => set({ managerId }),
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
