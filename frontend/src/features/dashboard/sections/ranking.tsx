import { useQuery } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'
import { ApiError } from '../../../lib/api'
import type { ManagerRankingMode } from '../entities'
import { formatAmount } from '../format-amount'
import { fetchDashboardRanking } from '../services'
import { pageSizes, useDashboardStore } from '../stores'

function errorText(error: unknown) {
  if (error instanceof ApiError) {
    return `Ошибка загрузки (${error.status})`
  }

  return 'Ошибка загрузки'
}

const choiceClass = (selected: boolean) =>
  selected
    ? 'rounded border border-menu bg-menu px-3 py-1 text-sm text-white'
    : 'rounded border border-line bg-white px-3 py-1 text-sm text-ink hover:border-menu'

const modes: { mode: ManagerRankingMode; label: string }[] = [
  { mode: 0, label: 'Gross Profit' },
  { mode: 1, label: 'Average Check' },
]

export function Ranking() {
  const { rankingMode, rankingSkip, rankingTake, setRankingMode, setRankingPage } = useDashboardStore(
    useShallow((state) => ({
      rankingMode: state.rankingMode,
      rankingSkip: state.rankingSkip,
      rankingTake: state.rankingTake,
      setRankingMode: state.setRankingMode,
      setRankingPage: state.setRankingPage,
    })),
  )

  const ranking = useQuery({
    queryKey: ['dashboard', 'ranking', rankingMode, rankingSkip, rankingTake],
    queryFn: () => fetchDashboardRanking({ Mode: rankingMode, Skip: rankingSkip, Take: rankingTake }),
  })

  const items = ranking.data?.items ?? []

  return (
    <section className="flex flex-col gap-3">
      <div className="flex gap-2" role="group" aria-label="Показатель рейтинга">
        {modes.map((item) => (
          <button
            key={item.mode}
            type="button"
            aria-pressed={rankingMode === item.mode}
            className={choiceClass(rankingMode === item.mode)}
            onClick={() => setRankingMode(item.mode)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2" role="group" aria-label="Размер страницы">
        {pageSizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={rankingTake === size}
            className={choiceClass(rankingTake === size)}
            onClick={() => setRankingPage(rankingSkip, size)}
          >
            {size}
          </button>
        ))}
      </div>
      {ranking.isPending ? <p>Загрузка</p> : null}
      {ranking.isError ? <p>{errorText(ranking.error)}</p> : null}
      {ranking.isSuccess ? (
        items.length === 0 ? (
          <p>Нет менеджеров</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.managerId} className="flex items-center gap-3 rounded border border-line bg-white p-3">
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : null}
                <span className="text-ink">{item.name}</span>
                <span className="text-sm text-ink">{item.teamName}</span>
                <span className="text-sm text-ink">{item.positionName}</span>
                <span className="ml-auto text-ink">
                  {formatAmount(rankingMode === 0 ? item.grossProfit : item.averageCheck)}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  )
}
