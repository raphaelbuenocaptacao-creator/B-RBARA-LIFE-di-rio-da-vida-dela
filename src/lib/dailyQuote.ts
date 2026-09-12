export const DAILY_QUOTES = [
  'Você não precisa fazer tudo hoje. Precisa apenas continuar.',
  'Cuide da mulher que você está se tornando.',
  'Pequenos passos também constroem grandes mudanças.',
  'Faça por você.',
  'Seu ritmo também é progresso.',
  'Hoje merece um pouco de cuidado e gentileza com você.',
  'Consistência vale mais do que perfeição.',
]

export function getDailyQuote(date: Date): string {
  const dayKey = Number(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`)
  return DAILY_QUOTES[dayKey % DAILY_QUOTES.length]
}
