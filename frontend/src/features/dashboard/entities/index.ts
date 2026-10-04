export type ManagerRankingMode = 0 | 1
export type CategoryStatMode = 0 | 1
export type SaleStatus = 0 | 1 | 2

export interface KpiCardsDto {
  revenue: number | null
  cost: number | null
  grossProfit: number | null
  margin: number | null
  salesCount: number
  averageCheck: number | null
}

export interface KpiCardsQuery {
  PeriodFrom?: string
  PeriodTo?: string
}

export interface ManagerRankingDto {
  managerId: string
  name: string | null
  avatar: string | null
  isActive: boolean
  teamName: string | null
  positionName: string | null
  grossProfit: number
  averageCheck: number
}

export interface ManagerRankingPageDto {
  items: ManagerRankingDto[] | null
  skip: number
  take: number
  sort: ManagerRankingMode
}

export interface ManagerRankingQuery {
  Mode?: ManagerRankingMode
  Skip?: number
  Take?: number
}

export interface ManagerDynamicsDto {
  date: string
  revenue: number | null
  grossProfit: number | null
  salesCount: number
}

export interface ManagerDynamicsQuery {
  ManagerId?: string
  DateFrom?: string
  DateTo?: string
}

export interface CategoryStatDto {
  id: string
  name: string | null
  salesCount: number
  revenue: number
}

export interface CategoryStatPageDto {
  items: CategoryStatDto[] | null
  skip: number
  take: number
  sort: CategoryStatMode
}

export interface CategoryStatQuery {
  DateFrom?: string
  DateTo?: string
  Mode?: CategoryStatMode
  Skip?: number
  Take?: number
}

export interface TopProductDto {
  id: string
  name: string | null
  revenue: number
}

export interface RecentSaleManagerDto {
  id: string
  name: string | null
  avatar: string | null
}

export interface RecentSaleCustomerDto {
  id: string
  name: string | null
}

export interface RecentSaleProductDto {
  id: string
  name: string | null
}

export interface RecentSaleDto {
  date: string
  manager: RecentSaleManagerDto
  customer: RecentSaleCustomerDto
  products: RecentSaleProductDto[] | null
  status: SaleStatus
  amount: number
  grossProfit: number
}

export interface RecentSalePageDto {
  items: RecentSaleDto[] | null
  skip: number
  take: number
}

export interface RecentSalesQuery {
  Skip?: number
  Take?: number
}
