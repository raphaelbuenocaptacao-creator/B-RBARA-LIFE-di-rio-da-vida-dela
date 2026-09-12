import { describe, expect, it } from 'vitest'
import { isDiaryPinValid, isProfileImageSizeAllowed, normalizeTheme, profilePhotoKey } from './profile'

describe('Bárbara profile helpers', () => {
  it('accepts only supported profile themes', () => {
    expect(normalizeTheme('rose')).toBe('rose')
    expect(normalizeTheme('light')).toBe('light')
    expect(normalizeTheme('night')).toBe('night')
    expect(normalizeTheme('anything')).toBe('rose')
  })

  it('requires a 4 to 6 digit diary PIN', () => {
    expect(isDiaryPinValid('1234')).toBe(true)
    expect(isDiaryPinValid('123456')).toBe(true)
    expect(isDiaryPinValid('123')).toBe(false)
    expect(isDiaryPinValid('12a4')).toBe(false)
  })

  it('keeps profile images inside the AUREON Base private-storage limit', () => {
    expect(isProfileImageSizeAllowed(64 * 1024)).toBe(true)
    expect(isProfileImageSizeAllowed(128 * 1024)).toBe(true)
    expect(isProfileImageSizeAllowed(128 * 1024 + 1)).toBe(false)
  })

  it('builds a user-scoped private profile photo key', () => {
    expect(profilePhotoKey('user-123', 'jpeg')).toBe('profiles/user-123/avatar.jpeg')
  })
})
