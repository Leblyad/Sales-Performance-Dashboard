import { z } from 'zod'

export const dashboardSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>
