import { useShallow } from 'zustand/react/shallow'
import { pageSizes, useDashboardStore } from '../stores'

export function Categories() {
  const { categoryMode, categorySkip, categoryTake, setCategoryPage } = useDashboardStore(
    useShallow((state) => ({
      categoryMode: state.categoryMode,
      categorySkip: state.categorySkip,
      categoryTake: state.categoryTake,
      setCategoryPage: state.setCategoryPage,
    })),
  )

  return (
    <section className="flex flex-col gap-3">
      <p>{categoryMode === 0 ? 'Количество продаж' : 'Revenue'}</p>
      <div className="flex gap-2" role="group" aria-label="Размер страницы">
        {pageSizes.map((size) => (
          <button
            key={size}
            type="button"
            aria-pressed={categoryTake === size}
            className={
              categoryTake === size
                ? 'rounded border border-menu bg-menu px-3 py-1 text-sm text-white'
                : 'rounded border border-line bg-white px-3 py-1 text-sm text-ink hover:border-menu'
            }
            onClick={() => setCategoryPage(categorySkip, size)}
          >
            {size}
          </button>
        ))}
      </div>
    </section>
  )
}
