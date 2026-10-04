import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { ApiError } from '../../../lib/api'
import { formatAmount } from '../format-amount'
import { periodIssue } from '../period'
import { fetchDashboardDynamics } from '../services'
import { periodPresets, periodRange, type PeriodKind, type PeriodPreset } from '../stores'

type DynamicsMetric = 'revenue' | 'grossProfit' | 'salesCount'

const dynamicsMetrics: { metric: DynamicsMetric; label: string }[] = [
  { metric: 'revenue', label: 'Revenue' },
  { metric: 'grossProfit', label: 'Gross Profit' },
  { metric: 'salesCount', label: 'Количество продаж' },
]
import { PeriodCalendar } from './period-calendar'

function errorText(error: unknown) {
  if (error instanceof ApiError) {
    return `Ошибка загрузки (${error.status})`
  }

  return 'Ошибка загрузки'
}

function axisDate(value: string) {
  return `${value.slice(8, 10)}.${value.slice(5, 7)}`
}

function seriesValue(
  metric: DynamicsMetric,
  row: { revenue: number | null; grossProfit: number | null; salesCount: number },
) {
  if (metric === 'salesCount') {
    return row.salesCount
  }

  return row[metric]
}

function PointTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || payload.length === 0) {
    return null
  }

  const raw = payload[0]?.value
  const value = typeof raw === 'number' ? raw : null

  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm">
      <p>{label}</p>
      <p className="font-semibold tabular-nums">{formatAmount(value)}</p>
    </div>
  )
}

const segmentClass = (selected: boolean) =>
  `border-r border-line px-2 py-1 text-xs font-medium last:border-r-0 focus-visible:outline-2 focus-visible:outline-menu ${
    selected ? 'bg-menu text-white' : 'bg-white text-ink hover:bg-canvas'
  }`

export function RankingChart({
  managerId,
  label,
  onHide,
}: {
  managerId: string
  label: string
  onHide: () => void
}) {
  const initialPeriod = periodRange('sevenDays')
  const [dynamicsMetric, setDynamicsMetric] = useState<DynamicsMetric>('revenue')
  const [chartPeriodKind, setChartPeriodKind] = useState<PeriodKind>('sevenDays')
  const [chartPeriodFrom, setChartPeriodFrom] = useState(initialPeriod.periodFrom)
  const [chartPeriodTo, setChartPeriodTo] = useState(initialPeriod.periodTo)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)

  function setChartPeriodPreset(kind: PeriodPreset) {
    const next = periodRange(kind)
    setChartPeriodKind(kind)
    setChartPeriodFrom(next.periodFrom)
    setChartPeriodTo(next.periodTo)
    setCalendarOpen(false)
    setPendingFrom(null)
  }

  function setChartCustomPeriod(from: string, to: string) {
    setChartPeriodKind('custom')
    setChartPeriodFrom(from)
    setChartPeriodTo(to)
  }
  const pickerRef = useRef<HTMLDivElement>(null)
  const choosing = calendarOpen && pendingFrom !== null
  const issue = periodIssue(chartPeriodFrom, chartPeriodTo)
  const canLoad = issue === null && !choosing && managerId !== ''
  const dynamics = useQuery({
    queryKey: ['dashboard', 'dynamics', managerId, chartPeriodFrom, chartPeriodTo],
    queryFn: () =>
      fetchDashboardDynamics({
        ManagerId: managerId,
        DateFrom: chartPeriodFrom,
        DateTo: chartPeriodTo,
      }),
    enabled: canLoad,
    retry: false,
  })
  const points = (dynamics.data ?? []).map((row) => ({
    date: row.date.slice(0, 10),
    value: seriesValue(dynamicsMetric, row),
  }))
  const rangeMessage = choosing ? 'Выберите дату окончания' : issue
  const metricLabel = dynamicsMetrics.find((item) => item.metric === dynamicsMetric)?.label ?? ''
  const rangeLabel = chartPeriodKind === 'today' ? chartPeriodFrom : `${chartPeriodFrom} — ${chartPeriodTo}`

  useEffect(() => {
    if (!calendarOpen) {
      return
    }

    function closeOnOutside(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setCalendarOpen(false)
        setPendingFrom(null)
      }
    }

    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [calendarOpen])

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-[1.7] flex-col gap-2 rounded-xl border border-line bg-white p-3">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <h3 className="text-base font-semibold">{label}</h3>
        <button
          type="button"
          className="rounded-md border border-line px-2 py-1 text-xs font-medium text-ink hover:border-menu focus-visible:outline-2 focus-visible:outline-menu"
          onClick={onHide}
        >
          Скрыть
        </button>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-line p-1">
        <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Показатель графика">
          {dynamicsMetrics.map((item) => (
            <button
              key={item.metric}
              type="button"
              aria-pressed={dynamicsMetric === item.metric}
              className={segmentClass(dynamicsMetric === item.metric)}
              onClick={() => setDynamicsMetric(item.metric)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-md border border-line" role="group" aria-label="Период графика">
          {periodPresets.map((preset) => (
            <button
              key={preset.kind}
              type="button"
              aria-pressed={chartPeriodKind === preset.kind}
              className={segmentClass(chartPeriodKind === preset.kind)}
              onClick={() => {
                setPendingFrom(null)
                setCalendarOpen(false)
                setChartPeriodPreset(preset.kind)
              }}
            >
              {preset.label}
            </button>
          ))}
          <div ref={pickerRef} className="relative">
            <button
              type="button"
              aria-pressed={chartPeriodKind === 'custom'}
              aria-expanded={calendarOpen}
              className={segmentClass(chartPeriodKind === 'custom')}
              onClick={() => {
                setPendingFrom(null)
                setCalendarOpen(!calendarOpen)
                if (chartPeriodKind !== 'custom') {
                  setChartCustomPeriod(chartPeriodFrom, chartPeriodTo)
                }
              }}
            >
              Произвольный
            </button>
            {calendarOpen ? (
              <PeriodCalendar
                align="right"
                from={chartPeriodFrom}
                to={chartPeriodTo}
                pendingFrom={pendingFrom}
                onPending={setPendingFrom}
                onCommit={(from, to) => {
                  setPendingFrom(null)
                  setCalendarOpen(false)
                  setChartCustomPeriod(from, to)
                }}
              />
            ) : null}
          </div>
        </div>
        {rangeMessage ? (
          <p role="alert" className="px-1 text-xs text-red-700">
            {rangeMessage}
          </p>
        ) : (
          <p className="px-1 text-xs text-ink/80">
            {metricLabel}: {rangeLabel}
          </p>
        )}
      </div>
      <div className="min-h-0 flex-1">
        {canLoad && dynamics.isPending ? <p>Загрузка</p> : null}
        {canLoad && dynamics.isError ? <p className="text-red-700">{errorText(dynamics.error)}</p> : null}
        {canLoad && dynamics.isSuccess && points.length === 0 ? <p>Нет продаж за период</p> : null}
        {canLoad && dynamics.isSuccess && points.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid stroke="#dbeafe" vertical={false} />
              <XAxis dataKey="date" tickFormatter={axisDate} minTickGap={28} tick={{ fill: '#1e3a8a', fontSize: 12 }} />
              <YAxis
                width={112}
                tickFormatter={(value: number) => formatAmount(value)}
                tick={{ fill: '#1e3a8a', fontSize: 12 }}
              />
              <Tooltip content={PointTooltip} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#1d4ed8' }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </aside>
  )
}
