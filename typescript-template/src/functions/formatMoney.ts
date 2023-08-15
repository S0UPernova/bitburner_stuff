

export function formatMoney(num: number): string {
  return Intl.NumberFormat('en-us').format(num)
}