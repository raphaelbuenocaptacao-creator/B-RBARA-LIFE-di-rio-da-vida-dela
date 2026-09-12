export type ProfileTheme = 'rose' | 'light' | 'night'

const MAX_PROFILE_IMAGE_BYTES = 128 * 1024
const PIN_ITERATIONS = 120_000
export const DIARY_PIN_STORAGE_KEY = 'barbara_life_diary_pin_v1'
export const THEME_STORAGE_KEY = 'barbara_life_theme_v1'

export type DiaryPinRecord = {
  version: 1
  salt: string
  hash: string
}

export function normalizeTheme(value: unknown): ProfileTheme {
  return value === 'light' || value === 'night' || value === 'rose' ? value : 'rose'
}

export function applyTheme(value: unknown) {
  const theme = normalizeTheme(value)
  document.documentElement.dataset.theme = theme
  try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch {}
  return theme
}

export function restoreTheme() {
  let stored: string | null = null
  try { stored = localStorage.getItem(THEME_STORAGE_KEY) } catch {}
  return applyTheme(stored)
}

export function isDiaryPinValid(pin: string) {
  return /^\d{4,6}$/.test(pin)
}

export function isProfileImageSizeAllowed(size: number) {
  return Number.isFinite(size) && size > 0 && size <= MAX_PROFILE_IMAGE_BYTES
}

export function profilePhotoKey(userId: string, extension = 'jpeg') {
  const safeExtension = String(extension || 'jpeg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpeg'
  return `profiles/${userId}/avatar.${safeExtension}`
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function pbkdf2(pin: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PIN_ITERATIONS },
    key,
    256,
  )
  return new Uint8Array(bits)
}

export async function createDiaryPinRecord(pin: string): Promise<DiaryPinRecord> {
  if (!isDiaryPinValid(pin)) throw new Error('invalid_diary_pin')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const digest = await pbkdf2(pin, salt)
  return { version: 1, salt: bytesToBase64(salt), hash: bytesToBase64(digest) }
}

export function loadDiaryPinRecord(): DiaryPinRecord | null {
  try {
    const raw = localStorage.getItem(DIARY_PIN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DiaryPinRecord
    if (parsed?.version !== 1 || typeof parsed.salt !== 'string' || typeof parsed.hash !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

export function saveDiaryPinRecord(record: DiaryPinRecord | null) {
  try {
    if (record) localStorage.setItem(DIARY_PIN_STORAGE_KEY, JSON.stringify(record))
    else localStorage.removeItem(DIARY_PIN_STORAGE_KEY)
  } catch {}
}

export async function verifyDiaryPin(pin: string, record: DiaryPinRecord | null | undefined) {
  if (!record || record.version !== 1 || !isDiaryPinValid(pin)) return false
  try {
    const expected = base64ToBytes(record.hash)
    const actual = await pbkdf2(pin, base64ToBytes(record.salt))
    if (expected.length !== actual.length) return false
    let diff = 0
    for (let i = 0; i < expected.length; i += 1) diff |= expected[i] ^ actual[i]
    return diff === 0
  } catch {
    return false
  }
}

export async function compressProfileImage(file: File): Promise<{ base64: string; contentType: string; bytes: number }> {
  if (!file.type.startsWith('image/')) throw new Error('invalid_profile_image')

  const bitmap = await createImageBitmap(file)
  try {
    const maxSide = 512
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('image_processing_unavailable')
    context.drawImage(bitmap, 0, 0, width, height)

    for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
      if (!blob) continue
      if (!isProfileImageSizeAllowed(blob.size)) continue
      const buffer = new Uint8Array(await blob.arrayBuffer())
      return { base64: bytesToBase64(buffer), contentType: 'image/jpeg', bytes: blob.size }
    }
    throw new Error('profile_image_too_large')
  } finally {
    bitmap.close()
  }
}

export function profileImageDataUrl(contentType: string, base64: string) {
  return `data:${contentType || 'image/jpeg'};base64,${base64}`
}
