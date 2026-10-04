export const dashboardSections = [
  { id: 'kpi', label: 'KPI' },
  { id: 'ranking', label: 'Рейтинг менеджеров' },
  { id: 'dynamics', label: 'Динамика' },
  { id: 'categories', label: 'Категории' },
  { id: 'products', label: 'Продукты' },
  { id: 'sales', label: 'Последние продажи' },
] as const

export type DashboardSectionId = (typeof dashboardSections)[number]['id']
