function round2(value: number) {
  return Math.round(value * 100) / 100
}

export function formatAmount(value: number | null) {
  if (value === null) {
    return '—'
  }

  const negative = value < 0
  const [whole, frac] = Math.abs(round2(value)).toFixed(2).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return `${negative ? '-' : ''}${grouped}.${frac}`
}
