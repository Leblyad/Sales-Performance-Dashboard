import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  dashboardSections,
  readDashboardSection,
  type DashboardSectionId,
} from '../features/dashboard/navigation'
import { Categories } from '../features/dashboard/sections/categories'
import { KpiCards } from '../features/dashboard/sections/kpi-cards'
import { Products } from '../features/dashboard/sections/products'
import { Ranking } from '../features/dashboard/sections/ranking'
import { RecentSales } from '../features/dashboard/sections/recent-sales'
import { Trend } from '../features/dashboard/sections/trend'

const sectionContent: Record<DashboardSectionId, ReactNode> = {
  kpi: <KpiCards />,
  ranking: <Ranking />,
  dynamics: <Trend />,
  categories: <Categories />,
  products: <Products />,
  sales: <RecentSales />,
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    section: readDashboardSection(search.section),
  }),
  component: DashboardRoute,
})

function DashboardRoute() {
  const { section } = Route.useSearch()
  const current = dashboardSections.find((item) => item.id === section) ?? dashboardSections[0]

  return (
    <main className="flex h-full min-h-0 flex-col gap-4 p-6">
      <h1 className="shrink-0 text-2xl font-semibold">Панель продаж</h1>
      <section
        key={current.id}
        id={current.id}
        className="section-in min-h-0 flex-1 overflow-auto rounded-lg border border-line bg-card p-5"
      >
        <h2 className="text-lg font-semibold">{current.label}</h2>
        {sectionContent[current.id]}
      </section>
    </main>
  )
}
