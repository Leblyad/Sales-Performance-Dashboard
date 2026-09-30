import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQueryKey, fetchDashboardSummary } from '../features/dashboard/api'
import { Categories } from '../features/dashboard/categories'
import { KpiCards } from '../features/dashboard/kpi-cards'
import { dashboardSearchSchema } from '../features/dashboard/period'
import { Ranking } from '../features/dashboard/ranking'
import { RecentSales } from '../features/dashboard/recent-sales'
import { DashboardState } from '../features/dashboard/states'
import { Trend } from '../features/dashboard/trend'

export const Route = createFileRoute('/')({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: DashboardRoute,
})

function DashboardRoute() {
  const search = Route.useSearch()

  useQuery({
    queryKey: [...dashboardQueryKey, search],
    queryFn: fetchDashboardSummary,
    enabled: false,
  })

  return (
    <main>
      <h1>Sales dashboard</h1>
      <DashboardState />
      <KpiCards />
      <Ranking />
      <Trend />
      <Categories />
      <RecentSales />
    </main>
  )
}
