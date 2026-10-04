import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { ApiError } from '../../../lib/api'
import { periodIssue, previousWindow } from '../period'
import { formatAmount } from '../format-amount'
import { fetchDashboardKpi, fetchDashboardRanking } from '../services'
import { periodKey, periodPresets, rankingKey, useDashboardStore } from '../stores'
import { PeriodCalendar } from './period-calendar'

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function periodDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) {
    return null
  }

  const currentRounded = round2(current)
  const previousRounded = round2(previous)
  const delta = round2(currentRounded - previousRounded)
  const percent = previousRounded === 0 ? null : round2((delta / previousRounded) * 100)
  const amount = delta > 0 ? `+${formatAmount(delta)}` : formatAmount(delta)
  const percentText =
    percent === null ? '' : percent > 0 ? ` (+${formatAmount(percent)}%)` : ` (${formatAmount(percent)}%)`
  const text = `${amount}${percentText}`
  if (delta > 0) {
    return { text, className: 'text-green-700' }
  }

  if (delta < 0) {
    return { text, className: 'text-red-700' }
  }

  return { text, className: 'text-neutral-500' }
}

function errorText(error: unknown) {
  if (error instanceof ApiError) {
    return `Ошибка загрузки (${error.status})`
  }

  return 'Ошибка загрузки'
}

const choiceClass = (selected: boolean) =>
  selected
    ? 'rounded-lg border border-menu bg-menu px-3 py-2 text-sm font-medium text-white'
    : 'rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink hover:border-menu focus-visible:outline-2 focus-visible:outline-menu'

function MetricValue({
  loading,
  error,
  value,
}: {
  loading: boolean
  error: string | null
  value: string | null
}) {
  if (loading) {
    return <div className="h-8 w-28 rounded-md bg-line motion-safe:animate-pulse" />
  }

  if (error) {
    return <p className="text-base font-medium text-red-700">{error}</p>
  }

  return <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
}

export function KpiCards() {
  const { periodKind, periodFrom, periodTo, setPeriodPreset, setCustomPeriod } = useDashboardStore(
    useShallow((state) => ({
      periodKind: state.periodKind,
      periodFrom: state.periodFrom,
      periodTo: state.periodTo,
      setPeriodPreset: state.setPeriodPreset,
      setCustomPeriod: state.setCustomPeriod,
    })),
  )
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const choosing = calendarOpen && pendingFrom !== null
  const issue = periodIssue(periodFrom, periodTo)
  const canLoad = issue === null && !choosing
  const previousBounds = previousWindow(periodKind, periodFrom, periodTo)
  const previousFrom = previousBounds?.PeriodFrom ?? ''
  const previousTo = previousBounds?.PeriodTo ?? ''
  const cachedCurrent = useDashboardStore((state) => state.kpiByPeriod[periodKey(periodFrom, periodTo)])
  const cachedPrevious = useDashboardStore((state) =>
    previousBounds === null ? undefined : state.kpiByPeriod[periodKey(previousFrom, previousTo)],
  )
  const rememberKpi = useDashboardStore((state) => state.rememberKpi)

  const kpi = useQuery({
    queryKey: ['dashboard', 'kpi', periodFrom, periodTo],
    queryFn: () => fetchDashboardKpi({ PeriodFrom: periodFrom, PeriodTo: periodTo }),
    enabled: canLoad && cachedCurrent === undefined,
    retry: false,
  })

  const previous = useQuery({
    queryKey: ['dashboard', 'kpi', 'previous', previousFrom, previousTo],
    queryFn: () => fetchDashboardKpi({ PeriodFrom: previousFrom, PeriodTo: previousTo }),
    enabled: canLoad && previousBounds !== null && cachedPrevious === undefined,
    retry: false,
  })

  useEffect(() => {
    if (kpi.data) {
      rememberKpi(periodFrom, periodTo, kpi.data)
    }
  }, [kpi.data, periodFrom, periodTo, rememberKpi])

  useEffect(() => {
    if (previous.data && previousFrom !== '' && previousTo !== '') {
      rememberKpi(previousFrom, previousTo, previous.data)
    }
  }, [previous.data, previousFrom, previousTo, rememberKpi])

  const currentCards = cachedCurrent ?? kpi.data
  const previousCards = cachedPrevious ?? previous.data

  const cachedBest = useDashboardStore((state) => state.rankingByQuery[rankingKey(0, 0, 1)])
  const rememberRanking = useDashboardStore((state) => state.rememberRanking)
  const best = useQuery({
    queryKey: ['dashboard', 'ranking', 0, 0, 1],
    queryFn: () => fetchDashboardRanking({ Mode: 0, Skip: 0, Take: 1 }),
    enabled: cachedBest === undefined,
    retry: false,
  })

  useEffect(() => {
    if (best.data) {
      rememberRanking(0, 0, 1, best.data)
    }
  }, [best.data, rememberRanking])

  const bestPage = cachedBest ?? best.data

  const metrics = [
    { title: 'Выручка', current: currentCards?.revenue ?? null, prior: previousCards?.revenue ?? null },
    { title: 'Валовая прибыль', current: currentCards?.grossProfit ?? null, prior: previousCards?.grossProfit ?? null },
    { title: 'Маржинальность', current: currentCards?.margin ?? null, prior: previousCards?.margin ?? null },
    { title: 'Количество продаж', current: currentCards?.salesCount ?? null, prior: previousCards?.salesCount ?? null },
    { title: 'Средний чек', current: currentCards?.averageCheck ?? null, prior: previousCards?.averageCheck ?? null },
  ]
  const leader = bestPage?.items?.[0]
  const kpiError = canLoad && currentCards === undefined && kpi.isError ? errorText(kpi.error) : null
  const rangeMessage = choosing ? 'Выберите дату окончания' : issue

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
    <section className="flex flex-col gap-4">
      <div className="flex shrink-0 flex-wrap items-center gap-2" role="group" aria-label="Период">
        {periodPresets.map((preset) => (
          <button
            key={preset.kind}
            type="button"
            aria-pressed={periodKind === preset.kind}
            className={choiceClass(periodKind === preset.kind)}
            onClick={() => {
              setPendingFrom(null)
              setCalendarOpen(false)
              setPeriodPreset(preset.kind)
            }}
          >
            {preset.label}
          </button>
        ))}
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            aria-pressed={periodKind === 'custom'}
            aria-expanded={calendarOpen}
            className={choiceClass(periodKind === 'custom')}
            onClick={() => {
              setPendingFrom(null)
              setCalendarOpen(!calendarOpen)
              if (periodKind !== 'custom') {
                setCustomPeriod(periodFrom, periodTo)
              }
            }}
          >
            Произвольный
          </button>
          {calendarOpen ? (
            <PeriodCalendar
              from={periodFrom}
              to={periodTo}
              pendingFrom={pendingFrom}
              onPending={setPendingFrom}
              onCommit={(from, to) => {
                setPendingFrom(null)
                setCustomPeriod(from, to)
              }}
            />
          ) : null}
        </div>
      </div>
      {rangeMessage ? (
        <p role="alert" className="text-lg text-red-700">
          {rangeMessage}
        </p>
      ) : (
        <p className="text-lg text-ink">{periodKind === 'today' ? periodFrom : `${periodFrom} — ${periodTo}`}</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric) => {
          const delta =
            canLoad && currentCards ? periodDelta(metric.current, previousBounds === null ? null : (previousCards ? metric.prior : null)) : null
          return (
            <article
              key={metric.title}
              className="rounded-xl border border-line bg-white p-4 shadow-sm"
            >
              <h2 className="text-sm font-medium text-ink/70">{metric.title}</h2>
              <div className="mt-2">
                <MetricValue
                  loading={canLoad && currentCards === undefined && kpi.isPending}
                  error={kpiError}
                  value={canLoad && currentCards ? formatAmount(metric.current) : null}
                />
              </div>
              <p className={`mt-2 min-h-5 text-sm font-medium ${delta?.className ?? ''}`}>{delta?.text ?? ''}</p>
            </article>
          )
        })}
        <article className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-ink/70">Лучший менеджер</h2>
          <div className="mt-2">
            {bestPage === undefined && best.isFetching ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-line motion-safe:animate-pulse" />
                <div className="h-5 w-32 rounded-md bg-line motion-safe:animate-pulse" />
              </div>
            ) : null}
            {bestPage === undefined && best.isError ? (
              <p className="text-base font-medium text-red-700">{errorText(best.error)}</p>
            ) : null}
            {leader ? (
              <div className="flex items-center gap-3">
                {leader.avatar ? (
                  <img src={leader.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : null}
                <div>
                  <p className="font-semibold">{leader.name}</p>
                  <p className="text-sm text-ink/80">{leader.teamName}</p>
                  <p className="text-sm text-ink/80">{leader.positionName}</p>
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  )
}
