export function calculateProgress(raised: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(Math.round((raised / goal) * 100), 100)
}
