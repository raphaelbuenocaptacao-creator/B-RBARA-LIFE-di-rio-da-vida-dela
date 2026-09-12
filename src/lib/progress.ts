export function calculateCompletionRate(completed: number, total: number): number {
  if (total <= 0) return 0
  const rate = Math.round((Math.max(0, completed) / total) * 100)
  return Math.min(100, rate)
}
