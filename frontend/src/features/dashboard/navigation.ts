export const dashboardSections = [
  { id: 'kpi', label: 'KPI' },
  { id: 'ranking', label: 'Рейтинг менеджеров' },
  { id: 'categories', label: 'Категории' },
] as const

export type DashboardSectionId = (typeof dashboardSections)[number]['id']

const dashboardSectionIds = new Set<string>(dashboardSections.map((section) => section.id))

export function readDashboardSection(value: unknown): DashboardSectionId {
  if (typeof value === 'string' && dashboardSectionIds.has(value)) {
    return value as DashboardSectionId
  }

  return 'kpi'
}
