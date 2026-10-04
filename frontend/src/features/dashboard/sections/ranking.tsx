import { useShallow } from 'zustand/react/shallow'
import { pageSizes, useDashboardStore } from '../stores'

export function Ranking() {
  const { rankingMode, rankingSkip, rankingTake, setRankingPage } = useDashboardStore(
    useShallow((state) => ({
      rankingMode: state.rankingMode,
      rankingSkip: state.rankingSkip,
      rankingTake: state.rankingTake,
      setRankingPage: state.setRankingPage,
    })),
  )

  return (
    <section className="flex flex-col gap-3">
      <p>{rankingMode === 0 ? 'Gross Profit' : 'Average Check'}</p>
      <div className="flex gap-2" role="group" aria-label="Размер страницы">
        {pageSizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={rankingTake === size}
            className={
              rankingTake === size
                ? 'rounded border border-menu bg-menu px-3 py-1 text-sm text-white'
                : 'rounded border border-line bg-white px-3 py-1 text-sm text-ink hover:border-menu'
            }
            onClick={() => setRankingPage(rankingSkip, size)}
          >
            {size}
          </button>
        ))}
      </div>
    </section>
  )
}
