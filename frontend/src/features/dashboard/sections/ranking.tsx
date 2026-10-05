import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ManagerRankingMode } from '../entities'
import { formatAmount } from '../format-amount'
import { fetchDashboardRanking } from '../services'
import { pageSizes, rankingKey, useDashboardStore, type PageSize } from '../stores'
import { RankingChart } from './ranking-chart'
import { BlockLoader, SidePanel, useErrorToast } from './states'

const segmentClass = (selected: boolean) =>
  `border-r border-line px-2 py-1 text-xs last:border-r-0 focus-visible:outline-2 focus-visible:outline-menu ${
    selected ? 'bg-menu text-white' : 'bg-white text-ink hover:bg-canvas'
  }`

function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path d="M3 15.5h14M4 13l3.5-4 3 2.5L15 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChartOffIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

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

  function toggleRankingChart(id: string, label: string) {
    setSelected((current) => (current?.id === id ? null : { id, label }))
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
  useErrorToast(page === undefined && ranking.isError, ranking.error)

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
        </div>
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white">
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-auto">
          {page === undefined && ranking.isFetching ? <BlockLoader /> : null}
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
                  <th className="whitespace-nowrap px-3 py-2 text-center font-medium">График</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const selectedRow = selected?.id === item.managerId
                  const label = item.name ?? 'Менеджер'
                  return (
                    <tr
                      key={item.managerId}
                      aria-selected={selectedRow}
                      className={`border-b border-line last:border-b-0 ${selectedRow ? 'bg-line' : ''}`}
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
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          aria-pressed={selectedRow}
                          aria-label={selectedRow ? 'Скрыть график' : 'Показать график'}
                          className={`rounded-md p-1.5 focus-visible:outline-2 focus-visible:outline-menu ${
                            selectedRow ? 'bg-menu text-white' : 'text-menu hover:bg-canvas'
                          }`}
                          onClick={() => toggleRankingChart(item.managerId, label)}
                        >
                          {selectedRow ? <ChartOffIcon /> : <ChartIcon />}
                        </button>
                      </td>
                    </tr>
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
                aria-pressed={rankingTake === size}
                className={segmentClass(rankingTake === size)}
                onClick={() => setRankingPage(rankingSkip, size)}
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
              disabled={rankingSkip === 0}
              onClick={() => setRankingPage(Math.max(0, rankingSkip - rankingTake), rankingTake)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Дальше"
              className="bg-white px-2 py-1 text-sm text-ink hover:bg-canvas disabled:opacity-40"
              disabled={page === undefined || items.length < rankingTake}
              onClick={() => setRankingPage(rankingSkip + rankingTake, rankingTake)}
            >
              ›
            </button>
          </div>
        </div>
        </div>
      </div>
      <SidePanel open={selected !== null}>
        {selected ? <RankingChart managerId={selected.id} label={selected.label} onHide={() => setSelected(null)} /> : null}
      </SidePanel>
    </section>
  )
}
