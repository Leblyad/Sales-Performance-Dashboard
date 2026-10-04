import { createStore, useStore } from 'zustand'
import type {
  CategoryStatMode,
  CategoryStatPageDto,
  KpiCardsDto,
  ManagerRankingMode,
  ManagerRankingPageDto,
  TopProductDto,
} from '../entities'

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

export function categoryKey(periodFrom: string, periodTo: string, mode: CategoryStatMode, skip: number, take: number) {
  return `${periodFrom}|${periodTo}|${mode}|${skip}|${take}`
}

export interface DashboardUiState {
  periodKind: PeriodKind
  periodFrom: string
  periodTo: string
  kpiByPeriod: Record<string, KpiCardsDto>
  rankingByQuery: Record<string, ManagerRankingPageDto>
  categoryByQuery: Record<string, CategoryStatPageDto>
  topProducts: TopProductDto[] | null
  managerId: string
  setPeriodPreset: (kind: PeriodPreset) => void
  setCustomPeriod: (periodFrom: string, periodTo: string) => void
  rememberKpi: (periodFrom: string, periodTo: string, cards: KpiCardsDto) => void
  rememberRanking: (mode: ManagerRankingMode, skip: number, take: number, page: ManagerRankingPageDto) => void
  rememberCategory: (
    periodFrom: string,
    periodTo: string,
    mode: CategoryStatMode,
    skip: number,
    take: number,
    page: CategoryStatPageDto,
  ) => void
  rememberProducts: (products: TopProductDto[]) => void
  setManagerId: (managerId: string) => void
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

const period = periodRange('thirtyDays')

export const dashboardStore = createStore<DashboardUiState>()((set) => ({
  periodKind: 'thirtyDays',
  periodFrom: period.periodFrom,
  periodTo: period.periodTo,
  kpiByPeriod: {},
  rankingByQuery: {},
  categoryByQuery: {},
  topProducts: null,
  managerId: '',
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
  rememberCategory: (periodFrom, periodTo, mode, skip, take, page) =>
    set((state) => {
      const key = categoryKey(periodFrom, periodTo, mode, skip, take)
      if (state.categoryByQuery[key]) {
        return state
      }

      return { categoryByQuery: { ...state.categoryByQuery, [key]: page } }
    }),
  rememberProducts: (products) =>
    set((state) => {
      if (state.topProducts !== null) {
        return state
      }

      return { topProducts: products }
    }),
  setManagerId: (managerId) => set({ managerId }),
}))

export function useDashboardStore<T>(selector: (state: DashboardUiState) => T): T {
  return useStore(dashboardStore, selector)
}
