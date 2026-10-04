import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api'
import type { SaleStatus } from '../entities'
import { formatAmount } from '../format-amount'
import { fetchDashboardSales } from '../services'
import { pageSizes, type PageSize } from '../stores'

const statusLabel: Record<SaleStatus, string> = {
  0: 'Paid',
  1: 'Cancelled',
  2: 'Refunded',
}

function errorText(error: unknown) {
  if (error instanceof ApiError) {
    return `Ошибка загрузки (${error.status})`
  }

  return 'Ошибка загрузки'
}

function saleDate(value: string) {
  const day = value.slice(0, 10)
  return `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}`
}

const segmentClass = (selected: boolean) =>
  `border-r border-line px-2 py-1 text-xs last:border-r-0 focus-visible:outline-2 focus-visible:outline-menu ${
    selected ? 'bg-menu text-white' : 'bg-white text-ink hover:bg-canvas'
  }`

export function CategorySales({
  categoryId,
  label,
  onHide,
}: {
  categoryId: string
  label: string
  onHide: () => void
}) {
  const [salesSkip, setSalesSkip] = useState(0)
  const [salesTake, setSalesTake] = useState<PageSize>(10)
  const [pageCategoryId, setPageCategoryId] = useState(categoryId)
  if (pageCategoryId !== categoryId) {
    setPageCategoryId(categoryId)
    setSalesSkip(0)
  }

  function setSalesPage(skip: number, take: number) {
    if (take !== 10 && take !== 25 && take !== 50) {
      return
    }

    if (salesTake !== take) {
      setSalesTake(take)
      setSalesSkip(0)
      return
    }

    setSalesSkip(skip)
  }

  const sales = useQuery({
    queryKey: ['dashboard', 'sales', categoryId, salesSkip, salesTake],
    queryFn: () => fetchDashboardSales({ CategoryId: categoryId, Skip: salesSkip, Take: salesTake }),
    retry: false,
  })
  const page = sales.data
  const items = page?.items ?? []

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
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line">
      <div className="min-h-0 flex-1 overflow-auto">
        {sales.isPending ? <p className="p-4">Загрузка</p> : null}
        {sales.isError ? <p className="p-4 text-red-700">{errorText(sales.error)}</p> : null}
        {sales.isSuccess && items.length === 0 ? (
          <p className="p-4">{salesSkip === 0 ? 'Нет продаж' : 'На этой странице нет продаж'}</p>
        ) : null}
        {sales.isSuccess && items.length > 0 ? (
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-line text-ink/70">
                <th className="px-2 py-2 font-medium">Дата</th>
                <th className="px-2 py-2 font-medium">Менеджер</th>
                <th className="px-2 py-2 font-medium">Клиент</th>
                <th className="px-2 py-2 font-medium">Товары</th>
                <th className="px-2 py-2 font-medium">Статус</th>
                <th className="px-2 py-2 text-right font-medium">Сумма</th>
                <th className="px-2 py-2 text-right font-medium">Валовая прибыль</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const products = (item.products ?? []).map((product) => product.name).filter(Boolean).join(', ')
                return (
                  <tr key={`${item.date}-${item.manager.id}-${item.customer.id}`} className="border-b border-line last:border-b-0">
                    <td className="px-2 py-2 whitespace-nowrap text-ink">{saleDate(item.date)}</td>
                    <td className="px-2 py-2 text-ink">
                      <span className="flex items-center gap-2">
                        {item.manager.avatar ? (
                          <img src={item.manager.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : null}
                        <span>{item.manager.name ?? 'Менеджер'}</span>
                      </span>
                    </td>
                    <td className="px-2 py-2 text-ink">{item.customer.name ?? 'Клиент'}</td>
                    <td className="px-2 py-2 text-ink">{products || '—'}</td>
                    <td className="px-2 py-2 text-ink">{statusLabel[item.status]}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-ink">{formatAmount(item.amount)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-ink">{formatAmount(item.grossProfit)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line p-2">
        <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Размер страницы продаж">
          {pageSizes.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={salesTake === size}
              className={segmentClass(salesTake === size)}
              onClick={() => setSalesPage(salesSkip, size)}
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
            disabled={salesSkip === 0}
            onClick={() => setSalesPage(Math.max(0, salesSkip - salesTake), salesTake)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Дальше"
            className="bg-white px-2 py-1 text-sm text-ink hover:bg-canvas disabled:opacity-40"
            disabled={page === undefined || items.length < salesTake}
            onClick={() => setSalesPage(salesSkip + salesTake, salesTake)}
          >
            ›
          </button>
        </div>
      </div>
      </div>
    </aside>
  )
}
