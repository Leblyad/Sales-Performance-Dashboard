import { z } from 'zod'

export const dashboardSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>

function isCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export const dashboardPeriodSchema = z
  .object({
    from: z.string().refine(isCalendarDate, { message: 'Укажите существующую дату начала' }),
    to: z.string().refine(isCalendarDate, { message: 'Укажите существующую дату окончания' }),
  })
  .refine((value) => value.from <= value.to, { message: 'Дата начала позже даты окончания' })

export function periodIssue(from: string, to: string) {
  const parsed = dashboardPeriodSchema.safeParse({ from, to })
  if (parsed.success) {
    return null
  }

  return parsed.error.issues[0]?.message ?? 'Некорректный период'
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function inclusiveDays(from: Date, to: Date) {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((end - start) / 86400000) + 1
}

export function previousWindow(kind: string, from: string, to: string) {
  if (kind === 'custom') {
    return null
  }

  const start = parseIsoDate(from)
  const end = parseIsoDate(to)
  if (start === null || end === null || from > to) {
    return null
  }

  const length = inclusiveDays(start, end)
  const periodTo = addDays(start, -1)
  const periodFrom = addDays(periodTo, 1 - length)
  return { PeriodFrom: formatIsoDate(periodFrom), PeriodTo: formatIsoDate(periodTo) }
}
