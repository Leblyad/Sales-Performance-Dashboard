import { Fragment, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { CategoryStatMode } from '../entities'
import { formatAmount } from '../format-amount'
import { periodIssue } from '../period'
import { fetchDashboardCategories, fetchDashboardProducts } from '../services'
import {
  categoryKey,
  pageSizes,
  periodPresets,
  periodRange,
  useDashboardStore,
  type PageSize,
  type PeriodKind,
  type PeriodPreset,
} from '../stores'
import { CategorySales } from './category-sales'
import { PeriodCalendar } from './period-calendar'
import { BlockLoader, Collapse, SidePanel, useErrorToast } from './states'

const segmentClass = (selected: boolean) =>
  `border-r border-line px-2 py-1 text-xs last:border-r-0 focus-visible:outline-2 focus-visible:outline-menu ${
    selected ? 'bg-menu text-white' : 'bg-white text-ink hover:bg-canvas'
  }`

const modes: { mode: CategoryStatMode; label: string }[] = [
  { mode: 0, label: 'Продажи' },
  { mode: 1, label: 'Прибыль' },
]

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 text-ink transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function Categories() {
  const initialPeriod = periodRange('thirtyDays')
  const [periodKind, setPeriodKind] = useState<PeriodKind>('thirtyDays')
  const [periodFrom, setPeriodFrom] = useState(initialPeriod.periodFrom)
  const [periodTo, setPeriodTo] = useState(initialPeriod.periodTo)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [pendingFrom, setPendingFrom] = useState<string | null>(null)
  const [categoryMode, setCategoryMode] = useState<CategoryStatMode>(0)
  const [categorySkip, setCategorySkip] = useState(0)
  const [categoryTake, setCategoryTake] = useState<PageSize>(10)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const choosing = calendarOpen && pendingFrom !== null
  const issue = periodIssue(periodFrom, periodTo)
  const canLoad = issue === null && !choosing

  function setPeriodPreset(kind: PeriodPreset) {
    const next = periodRange(kind)
    setPeriodKind(kind)
    setPeriodFrom(next.periodFrom)
    setPeriodTo(next.periodTo)
    setCalendarOpen(false)
    setPendingFrom(null)
    setCategorySkip(0)
  }

  function setCustomPeriod(from: string, to: string) {
    setPeriodKind('custom')
    setPeriodFrom(from)
    setPeriodTo(to)
    setCategorySkip(0)
  }

  function setCategoryPage(skip: number, take: number) {
    if (take !== 10 && take !== 25 && take !== 50) {
      return
    }

    if (categoryTake !== take) {
      setCategoryTake(take)
      setCategorySkip(0)
      return
    }

    setCategorySkip(skip)
  }

  const cached = useDashboardStore(
    (state) => state.categoryByQuery[categoryKey(periodFrom, periodTo, categoryMode, categorySkip, categoryTake)],
  )
  const rememberCategory = useDashboardStore((state) => state.rememberCategory)
  const cachedProducts = useDashboardStore((state) => state.topProducts)
  const rememberProducts = useDashboardStore((state) => state.rememberProducts)
  const categories = useQuery({
    queryKey: ['dashboard', 'categories', periodFrom, periodTo, categoryMode, categorySkip, categoryTake],
    queryFn: () =>
      fetchDashboardCategories({
        DateFrom: periodFrom,
        DateTo: periodTo,
        Mode: categoryMode,
        Skip: categorySkip,
        Take: categoryTake,
      }),
    enabled: canLoad && cached === undefined,
    retry: false,
  })
  const products = useQuery({
    queryKey: ['dashboard', 'products'],
    queryFn: () => fetchDashboardProducts(),
    enabled: expandedId !== null && cachedProducts === null,
    retry: false,
  })

  useEffect(() => {
    if (categories.data) {
      rememberCategory(periodFrom, periodTo, categoryMode, categorySkip, categoryTake, categories.data)
    }
  }, [categories.data, periodFrom, periodTo, categoryMode, categorySkip, categoryTake, rememberCategory])

  useEffect(() => {
    if (products.data) {
      rememberProducts(products.data)
    }
  }, [products.data, rememberProducts])

  const page = canLoad ? (cached ?? categories.data) : undefined
  const items = page?.items ?? []
  const productItems = cachedProducts ?? products.data
  useErrorToast(canLoad && page === undefined && categories.isError, categories.error)
  useErrorToast(productItems == null && products.isError, products.error)
  const rangeMessage = choosing ? 'Выберите дату окончания' : issue
  const rangeLabel = periodKind === 'today' ? periodFrom : `${periodFrom} — ${periodTo}`

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

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [categorySkip, categoryTake])

  return (
    <section className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-line p-1">
          <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Сортировка категорий">
            {modes.map((item) => (
              <button
                key={item.mode}
                type="button"
                aria-pressed={categoryMode === item.mode}
                className={segmentClass(categoryMode === item.mode)}
                onClick={() => {
                  setCategoryMode(item.mode)
                  setCategorySkip(0)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-md border border-line" role="group" aria-label="Период категорий">
            {periodPresets.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                aria-pressed={periodKind === preset.kind}
                className={segmentClass(periodKind === preset.kind)}
                onClick={() => setPeriodPreset(preset.kind)}
              >
                {preset.label}
              </button>
            ))}
            <div ref={pickerRef} className="relative">
              <button
                type="button"
                aria-pressed={periodKind === 'custom'}
                aria-expanded={calendarOpen}
                className={segmentClass(periodKind === 'custom')}
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
        </div>
        {rangeMessage ? (
          <p role="alert" className="shrink-0 text-xs text-red-700">
            {rangeMessage}
          </p>
        ) : (
          <p className="shrink-0 text-xs text-ink/80">{rangeLabel}</p>
        )}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white">
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-auto">
          {canLoad && page === undefined && categories.isFetching ? <BlockLoader /> : null}
          {canLoad && page !== undefined && items.length === 0 ? (
            <p className="p-4">{categorySkip === 0 ? 'Нет продаж за период' : 'На этой странице нет категорий'}</p>
          ) : null}
          {canLoad && page !== undefined && items.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-line text-ink/70">
                  <th className="w-10 px-3 py-2 font-medium">
                    <span className="sr-only">Раскрыть</span>
                  </th>
                  <th className="w-px whitespace-nowrap py-2 pl-3 pr-16 font-medium">Категория</th>
                  <th className="w-px whitespace-nowrap py-2 pl-8 pr-3 text-left font-medium">Продажи</th>
                  <th className="px-3 py-2 text-right font-medium">Прибыль</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const open = expandedId === item.id
                  const label = item.name ?? 'Категория'
                  const selectedRow = selected?.id === item.id
                  return (
                    <Fragment key={item.id}>
                      <tr
                        tabIndex={0}
                        aria-expanded={open}
                        aria-selected={selectedRow}
                        className={`cursor-pointer border-b border-line focus-visible:outline-2 focus-visible:outline-menu ${
                          selectedRow ? 'bg-line' : 'hover:bg-canvas'
                        }`}
                        onClick={() => setExpandedId(open ? null : item.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setExpandedId(open ? null : item.id)
                          }
                        }}
                      >
                        <td className="px-3 py-2">
                          <Chevron open={open} />
                        </td>
                        <td className="w-px whitespace-nowrap py-2 pl-3 pr-16 font-medium text-ink">{label}</td>
                        <td className="w-px whitespace-nowrap py-2 pl-8 pr-3 text-left tabular-nums text-ink">{item.salesCount}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-ink">{formatAmount(item.revenue)}</td>
                      </tr>
                      <Collapse open={open} colSpan={4}>
                            {productItems == null && products.isFetching ? <BlockLoader rows={3} /> : null}
                            {productItems != null && productItems.length === 0 ? <p>Нет продуктов</p> : null}
                            {productItems != null && productItems.length > 0 ? (
                              <table className="w-full border-collapse bg-white text-left text-sm">
                                <thead>
                                  <tr className="border-b border-line text-ink/70">
                                    <th className="px-2 py-1 font-medium">Продукт</th>
                                    <th className="px-2 py-1 text-right font-medium">Прибыль</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productItems.map((product) => (
                                    <tr key={product.id} className="border-b border-line last:border-b-0">
                                      <td className="px-2 py-1 text-ink">{product.name ?? 'Продукт'}</td>
                                      <td className="px-2 py-1 text-right tabular-nums text-ink">
                                        {formatAmount(product.revenue)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : null}
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                className="rounded-md bg-menu px-3 py-2 text-sm font-medium text-white hover:bg-menu-hover focus-visible:outline-2 focus-visible:outline-menu"
                                onClick={() => setSelected({ id: item.id, label })}
                              >
                                Подробнее
                              </button>
                            </div>
                      </Collapse>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line p-2">
          <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Размер страницы">
            {pageSizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={categoryTake === size}
                className={segmentClass(categoryTake === size)}
                onClick={() => setCategoryPage(categorySkip, size)}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-md border border-line">
            <button
              type="button"
              aria-label="Назад"
              className="border-r border-line bg-white px-2 py-1 text-sm text-ink hover:bg-canvas disabled:opacity-40"
              disabled={categorySkip === 0}
              onClick={() => setCategoryPage(Math.max(0, categorySkip - categoryTake), categoryTake)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Дальше"
              className="bg-white px-2 py-1 text-sm text-ink hover:bg-canvas disabled:opacity-40"
              disabled={!canLoad || page === undefined || items.length < categoryTake}
              onClick={() => setCategoryPage(categorySkip + categoryTake, categoryTake)}
            >
              ›
            </button>
          </div>
        </div>
        </div>
      </div>
      <SidePanel open={selected !== null}>
        {selected ? (
          <CategorySales categoryId={selected.id} label={selected.label} onHide={() => setSelected(null)} />
        ) : null}
      </SidePanel>
    </section>
  )
}
