import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Categories } from '../features/dashboard/categories'
import { KpiCards } from '../features/dashboard/kpi-cards'
import { Products } from '../features/dashboard/products'
import { Ranking } from '../features/dashboard/ranking'
import { RecentSales } from '../features/dashboard/recent-sales'
import {
  dashboardSections,
  type DashboardSectionId,
} from '../features/dashboard/sections'
import { Trend } from '../features/dashboard/trend'

const sectionContent: Record<DashboardSectionId, ReactNode> = {
  kpi: <KpiCards />,
  ranking: <Ranking />,
  dynamics: <Trend />,
  categories: <Categories />,
  products: <Products />,
  sales: <RecentSales />,
}

export const Route = createFileRoute('/')({
  component: DashboardRoute,
})

function DashboardRoute() {
  return (
    <main className="flex h-full min-h-0 flex-col gap-4 p-6">
      <h1 className="shrink-0 text-2xl font-semibold">Панель продаж</h1>
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-4">
        {dashboardSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="min-h-0 overflow-auto scroll-mt-6 rounded-lg border border-line bg-card p-5 hover:border-menu"
          >
            <h2 className="text-lg font-semibold">{section.label}</h2>
            {sectionContent[section.id]}
          </section>
        ))}
      </div>
    </main>
  )
}
