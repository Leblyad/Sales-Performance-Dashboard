import { getJson } from '../../../lib/api'
import type {
  CategoryStatPageDto,
  CategoryStatQuery,
  KpiCardsDto,
  KpiCardsQuery,
  ManagerDynamicsDto,
  ManagerDynamicsQuery,
  ManagerRankingPageDto,
  ManagerRankingQuery,
  RecentSalePageDto,
  RecentSalesQuery,
  TopProductDto,
} from '../entities'

export function fetchDashboardKpi(query: KpiCardsQuery = {}) {
  return getJson<KpiCardsDto>('/api/dashboard/kpi', query)
}

export function fetchDashboardRanking(query: ManagerRankingQuery = {}) {
  return getJson<ManagerRankingPageDto>('/api/dashboard/ranking', query)
}

export function fetchDashboardDynamics(query: ManagerDynamicsQuery = {}) {
  return getJson<ManagerDynamicsDto[]>('/api/dashboard/dynamics', query)
}

export function fetchDashboardCategories(query: CategoryStatQuery = {}) {
  return getJson<CategoryStatPageDto>('/api/dashboard/categories', query)
}

export function fetchDashboardProducts() {
  return getJson<TopProductDto[]>('/api/dashboard/products')
}

export function fetchDashboardSales(query: RecentSalesQuery = {}) {
  return getJson<RecentSalePageDto>('/api/dashboard/sales', query)
}
