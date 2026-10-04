import { useState } from 'react'

const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthTitle(date: Date) {
  return new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' }).format(date)
}

export function PeriodCalendar({
  from,
  to,
  pendingFrom,
  onPending,
  onCommit,
  align = 'left',
}: {
  from: string
  to: string
  pendingFrom: string | null
  onPending: (day: string) => void
  onCommit: (from: string, to: string) => void
  align?: 'left' | 'right'
}) {
  const opened = parseIsoDate(pendingFrom ?? from) ?? new Date()
  const [cursor, setCursor] = useState(() => new Date(opened.getFullYear(), opened.getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const count = new Date(year, month + 1, 0).getDate()
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const days = Array.from({ length: count }, (_, index) => formatIsoDate(new Date(year, month, index + 1)))

  function choose(day: string) {
    if (pendingFrom === null) {
      onPending(day)
      return
    }

    const start = pendingFrom <= day ? pendingFrom : day
    const end = pendingFrom <= day ? day : pendingFrom
    onCommit(start, end)
  }

  return (
    <div
      className={`absolute top-full z-10 mt-2 w-80 rounded-xl border border-line bg-white p-4 shadow-lg ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Предыдущий месяц"
          className="rounded-lg px-2 py-1 text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-menu"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize">{monthTitle(cursor)}</p>
        <button
          type="button"
          aria-label="Следующий месяц"
          className="rounded-lg px-2 py-1 text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-menu"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink/70">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {Array.from({ length: offset }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {days.map((day) => {
          const start = pendingFrom ?? from
          const end = pendingFrom ? pendingFrom : to
          const edge = day === start || day === end
          const inside = start <= day && day <= end
          const single = start === end
          const shape = single
            ? 'rounded-full'
            : day === start
              ? 'rounded-l-full'
              : day === end
                ? 'rounded-r-full'
                : ''

          return (
            <button
              key={day}
              type="button"
              aria-pressed={edge}
              aria-label={day}
              className={`h-9 text-sm focus-visible:outline-2 focus-visible:outline-menu ${shape} ${
                edge ? 'bg-menu text-white' : inside ? 'bg-line text-ink' : 'text-ink hover:bg-canvas'
              }`}
              onClick={() => choose(day)}
            >
              {Number(day.slice(-2))}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-ink">
        {pendingFrom ? 'Выберите дату окончания' : `${from} — ${to}`}
      </p>
    </div>
  )
}
