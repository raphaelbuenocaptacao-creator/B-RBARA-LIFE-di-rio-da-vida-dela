import { describe, expect, it } from 'vitest'
import { flattenRecord, isBarbaraEmail } from './aureon'

describe('AUREON record helpers', () => {
  it('flattens AUREON project records into app rows', () => {
    expect(flattenRecord({ id: 'abc', data: { title: 'Cuidar de mim', completed: false }, created_at: '2026-09-12T12:00:00Z' })).toEqual({
      id: 'abc',
      title: 'Cuidar de mim',
      completed: false,
      created_at: '2026-09-12T12:00:00Z',
    })
  })

  it('only accepts the authorized Bárbara email', () => {
    expect(isBarbaraEmail('Barbaraloiolalimasilva@gmail.com')).toBe(true)
    expect(isBarbaraEmail('outra@pessoa.com')).toBe(false)
  })
})
