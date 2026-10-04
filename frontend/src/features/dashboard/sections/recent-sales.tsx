import { useShallow } from 'zustand/react/shallow'
import { pageSizes, useDashboardStore } from '../stores'

export function RecentSales() {
  const { salesSkip, salesTake, setSalesPage } = useDashboardStore(
    useShallow((state) => ({
      salesSkip: state.salesSkip,
      salesTake: state.salesTake,
      setSalesPage: state.setSalesPage,
    })),
  )

  return (
    <section>
      <div className="flex gap-2" role="group" aria-label="Размер страницы">
        {pageSizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={salesTake === size}
            className={
              salesTake === size
                ? 'rounded border border-menu bg-menu px-3 py-1 text-sm text-white'
                : 'rounded border border-line bg-white px-3 py-1 text-sm text-ink hover:border-menu'
            }
            onClick={() => setSalesPage(salesSkip, size)}
          >
            {size}
          </button>
        ))}
      </div>
    </section>
  )
}
