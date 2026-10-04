import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  dashboardSections,
  readDashboardSection,
  type DashboardSectionId,
} from '../features/dashboard/navigation'
import { Categories } from '../features/dashboard/sections/categories'
import { KpiCards } from '../features/dashboard/sections/kpi-cards'
import { Ranking } from '../features/dashboard/sections/ranking'

const sectionContent: Record<DashboardSectionId, ReactNode> = {
  kpi: <KpiCards />,
  ranking: <Ranking />,
  categories: <Categories />,
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
        className="section-in flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-lg border border-line bg-card p-5"
      >
        <h2 className="shrink-0 text-lg font-semibold">{current.label}</h2>
        <div className="flex min-h-0 flex-1 flex-col">{sectionContent[current.id]}</div>
      </section>
    </main>
  )
}
