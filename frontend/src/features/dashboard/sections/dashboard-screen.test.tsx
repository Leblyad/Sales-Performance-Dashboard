import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { ApiError } from '../../../lib/api'
import type { KpiCardsDto, ManagerRankingPageDto } from '../entities'
import { periodRange, dashboardStore } from '../stores'
import { KpiCards } from './kpi-cards'
import { Ranking } from './ranking'
import { clearToasts, ToastHost } from './states'

const fetchDashboardKpi = vi.hoisted(() => vi.fn())
const fetchDashboardRanking = vi.hoisted(() => vi.fn())

vi.mock('../services', () => ({
  fetchDashboardKpi,
  fetchDashboardRanking,
}))

vi.mock('./ranking-chart', () => ({
  RankingChart: () => null,
}))

const cards: KpiCardsDto = {
  revenue: 10,
  cost: 4,
  grossProfit: 6,
  margin: 0.6,
  salesCount: 2,
  averageCheck: 5,
}

const rankingPage: ManagerRankingPageDto = {
  items: [
    {
      managerId: 'm-1',
      name: 'Анна',
      avatar: null,
      isActive: true,
      teamName: 'Север',
      positionName: 'Менеджер',
      grossProfit: 6,
      averageCheck: 5,
    },
  ],
  skip: 0,
  take: 10,
  sort: 0,
}

function renderScreen(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      {ui}
      <ToastHost />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  clearToasts()
  const range = periodRange('thirtyDays')
  dashboardStore.setState({
    periodKind: 'thirtyDays',
    periodFrom: range.periodFrom,
    periodTo: range.periodTo,
    kpiByPeriod: {},
    rankingByQuery: {},
    categoryByQuery: {},
    topProducts: null,
    managerId: '',
  })
  fetchDashboardKpi.mockReset()
  fetchDashboardRanking.mockReset()
  fetchDashboardKpi.mockResolvedValue(cards)
  fetchDashboardRanking.mockResolvedValue(rankingPage)
})

describe('dashboard screen', () => {
  it('requests the selected period', async () => {
    const user = userEvent.setup()
    const initial = periodRange('thirtyDays')
    renderScreen(<KpiCards />)

    expect(screen.getByRole('button', { name: '30 дней' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(`${initial.periodFrom} — ${initial.periodTo}`)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Сегодня' }))

    const today = periodRange('today')
    expect(screen.getByRole('button', { name: 'Сегодня' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(today.periodFrom)).toBeInTheDocument()
    await waitFor(() => {
      expect(fetchDashboardKpi).toHaveBeenCalledWith({
        PeriodFrom: today.periodFrom,
        PeriodTo: today.periodTo,
      })
    })
  })

  it('requests the selected ranking mode', async () => {
    const user = userEvent.setup()
    renderScreen(<Ranking />)

    expect(screen.getByRole('button', { name: 'Gross Profit' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('columnheader', { name: 'Gross Profit' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Average Check' }))

    expect(screen.getByRole('button', { name: 'Average Check' })).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => {
      expect(fetchDashboardRanking).toHaveBeenCalledWith({ Mode: 1, Skip: 0, Take: 10 })
    })
    expect(await screen.findByRole('columnheader', { name: 'Average Check' })).toBeInTheDocument()
  })

  it('shows a loader while the ranking request is pending', async () => {
    fetchDashboardRanking.mockImplementation(() => new Promise(() => {}))
    renderScreen(<Ranking />)

    expect(await screen.findByRole('status', { name: 'Загрузка' })).toBeInTheDocument()
  })

  it('shows a ranking error as a notice that can be closed', async () => {
    const user = userEvent.setup()
    fetchDashboardRanking.mockRejectedValue(new ApiError(503, null))
    renderScreen(<Ranking />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Ошибка загрузки (503)')
    expect(screen.queryByRole('status', { name: 'Загрузка' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Закрыть' }))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
