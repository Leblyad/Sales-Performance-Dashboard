import { apiUrl } from '../../lib/api'

export const dashboardQueryKey = ['dashboard', 'summary'] as const

export async function fetchDashboardSummary(): Promise<null> {
  void apiUrl('/api/dashboard')
  return null
}
