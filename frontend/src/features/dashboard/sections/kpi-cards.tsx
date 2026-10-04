import { useShallow } from 'zustand/react/shallow'
import { useDashboardStore } from '../stores'

export function KpiCards() {
  const { periodFrom, periodTo } = useDashboardStore(
    useShallow((state) => ({
      periodFrom: state.periodFrom,
      periodTo: state.periodTo,
    })),
  )

  return (
    <section>
      <p>
        {periodFrom} — {periodTo}
      </p>
    </section>
  )
}
