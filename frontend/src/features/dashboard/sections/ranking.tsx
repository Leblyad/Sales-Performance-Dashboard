import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../../../lib/api'
import type { ManagerRankingMode } from '../entities'
import { formatAmount } from '../format-amount'
import { fetchDashboardRanking } from '../services'
import { pageSizes, rankingKey, useDashboardStore, type PageSize } from '../stores'
import { RankingChart } from './ranking-chart'

function errorText(error: unknown) {
  if (error instanceof ApiError) {
    return `Ошибка загрузки (${error.status})`
  }

  return 'Ошибка загрузки'
}

const segmentClass = (selected: boolean) =>
  `border-r border-line px-2 py-1 text-xs last:border-r-0 focus-visible:outline-2 focus-visible:outline-menu ${
    selected ? 'bg-menu text-white' : 'bg-white text-ink hover:bg-canvas'
  }`

const modes: { mode: ManagerRankingMode; label: string }[] = [
  { mode: 0, label: 'Gross Profit' },
  { mode: 1, label: 'Average Check' },
]

export function Ranking() {
  const [rankingMode, setRankingMode] = useState<ManagerRankingMode>(0)
  const [rankingSkip, setRankingSkip] = useState(0)
  const [rankingTake, setRankingTake] = useState<PageSize>(10)
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(null)

  function setRankingPage(skip: number, take: number) {
    if (take !== 10 && take !== 25 && take !== 50) {
      return
    }

    if (rankingTake !== take) {
      setRankingTake(take)
      setRankingSkip(0)
      return
    }

    setRankingSkip(skip)
  }

  function showRankingChart(id: string, label: string) {
    setSelected({ id, label })
  }
  const bodyRef = useRef<HTMLDivElement>(null)
  const cached = useDashboardStore((state) => state.rankingByQuery[rankingKey(rankingMode, rankingSkip, rankingTake)])
  const rememberRanking = useDashboardStore((state) => state.rememberRanking)
  const ranking = useQuery({
    queryKey: ['dashboard', 'ranking', rankingMode, rankingSkip, rankingTake],
    queryFn: () => fetchDashboardRanking({ Mode: rankingMode, Skip: rankingSkip, Take: rankingTake }),
    enabled: cached === undefined,
    retry: false,
  })

  useEffect(() => {
    if (ranking.data) {
      rememberRanking(rankingMode, rankingSkip, rankingTake, ranking.data)
    }
  }, [ranking.data, rankingMode, rankingSkip, rankingTake, rememberRanking])

  const page = cached ?? ranking.data
  const items = page?.items ?? []

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [rankingSkip, rankingTake])

  return (
    <section className="flex min-h-0 flex-1 gap-4">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-line p-1">
          <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Показатель рейтинга">
            {modes.map((item) => (
              <button
                key={item.mode}
                type="button"
                aria-pressed={rankingMode === item.mode}
                className={segmentClass(rankingMode === item.mode)}
                onClick={() => setRankingMode(item.mode)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-md border border-line" role="group" aria-label="Размер страницы">
            {pageSizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={rankingTake === size}
                className={segmentClass(rankingTake === size)}
                onClick={() => setRankingPage(rankingSkip, size)}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="ml-auto flex overflow-hidden rounded-md border border-line">
            <button
              type="button"
              className="border-r border-line bg-white px-2 py-1 text-xs text-ink hover:bg-canvas disabled:opacity-40"
              disabled={rankingSkip === 0}
              onClick={() => setRankingPage(Math.max(0, rankingSkip - rankingTake), rankingTake)}
            >
              Назад
            </button>
            <button
              type="button"
              className="bg-white px-2 py-1 text-xs text-ink hover:bg-canvas disabled:opacity-40"
              disabled={page === undefined || items.length < rankingTake}
              onClick={() => setRankingPage(rankingSkip + rankingTake, rankingTake)}
            >
              Дальше
            </button>
          </div>
        </div>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-auto rounded-lg border border-line bg-white">
          {page === undefined && ranking.isFetching ? <p className="p-4">Загрузка</p> : null}
          {page === undefined && ranking.isError ? <p className="p-4 text-red-700">{errorText(ranking.error)}</p> : null}
          {page !== undefined && items.length === 0 ? (
            <p className="p-4">{rankingSkip === 0 ? 'Нет менеджеров' : 'На этой странице нет менеджеров'}</p>
          ) : null}
          {page !== undefined && items.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-line text-ink/70">
                  <th className="px-3 py-2 font-medium">Менеджер</th>
                  <th className="px-3 py-2 font-medium">Команда</th>
                  <th className="px-3 py-2 font-medium">Должность</th>
                  <th className="px-3 py-2 text-right font-medium">
                    {rankingMode === 0 ? 'Gross Profit' : 'Average Check'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const selectedRow = selected?.id === item.managerId
                  const label = item.name ?? 'Менеджер'
                  return (
                    <tr
                      key={item.managerId}
                      tabIndex={0}
                      aria-selected={selectedRow}
                      className={`cursor-pointer border-b border-line last:border-b-0 focus-visible:outline-2 focus-visible:outline-menu ${
                        selectedRow ? 'bg-line' : 'hover:bg-canvas'
                      }`}
                      onClick={() => showRankingChart(item.managerId, label)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          showRankingChart(item.managerId, label)
                        }
                      }}
                    >
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-3">
                          {item.avatar ? (
                            <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : null}
                          <span className="font-medium text-ink">{label}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink">{item.teamName}</td>
                      <td className="px-3 py-2 text-ink">{item.positionName}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink">
                        {formatAmount(rankingMode === 0 ? item.grossProfit : item.averageCheck)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
      {selected ? (
        <RankingChart managerId={selected.id} label={selected.label} onHide={() => setSelected(null)} />
      ) : null}
    </section>
  )
}
