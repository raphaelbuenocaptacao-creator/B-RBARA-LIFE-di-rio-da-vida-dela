const API_URL = String(import.meta.env.VITE_AUREON_API_URL || 'https://aureonbase.vercel.app').replace(/\/$/, '')
export const PROJECT_SLUG = 'barbara-life'
export const BARBARA_EMAIL = 'barbaraloiolalimasilva@gmail.com'

const ACCESS_KEY = 'barbara_life_access_token'
const REFRESH_KEY = 'barbara_life_refresh_token'

export type AureonUser = {
  id: string
  email: string
  is_superadmin?: boolean
}

type AureonRecord<T extends Record<string, unknown>> = {
  id: string
  data: T
  owner_user_id?: string | null
  created_at?: string
  updated_at?: string
}

type RequestOptions = RequestInit & { retry?: boolean }

export function isBarbaraEmail(email: string) {
  return email.trim().toLowerCase() === BARBARA_EMAIL
}

export function flattenRecord<T extends Record<string, unknown>>(record: AureonRecord<T>): T & { id: string; created_at?: string; updated_at?: string } {
  return {
    id: record.id,
    ...record.data,
    ...(record.created_at ? { created_at: record.created_at } : {}),
    ...(record.updated_at ? { updated_at: record.updated_at } : {}),
  }
}

function readToken(key: string) {
  try { return localStorage.getItem(key) || '' } catch { return '' }
}

function writeToken(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {}
}

let accessToken = readToken(ACCESS_KEY)
let refreshToken = readToken(REFRESH_KEY)

function persistTokens(data: { access_token?: string; refresh_token?: string }) {
  if (data.access_token) {
    accessToken = data.access_token
    writeToken(ACCESS_KEY, accessToken)
  }
  if (data.refresh_token) {
    refreshToken = data.refresh_token
    writeToken(REFRESH_KEY, refreshToken)
  }
}

function clearTokens() {
  accessToken = ''
  refreshToken = ''
  writeToken(ACCESS_KEY, '')
  writeToken(REFRESH_KEY, '')
}

async function raw(path: string, options: RequestInit = {}, token = accessToken) {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_URL}${path}`, { ...options, headers })
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retry = true, ...fetchOptions } = options
  let response = await raw(path, fetchOptions)

  if (response.status === 401 && retry && refreshToken && path !== '/auth/refresh') {
    const refreshed = await raw('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, '')

    if (refreshed.ok) {
      persistTokens(await refreshed.json())
      response = await raw(path, fetchOptions)
    } else {
      clearTokens()
    }
  }

  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data?.error || `HTTP ${response.status}`) as Error & { status?: number; code?: string }
    error.status = response.status
    error.code = data?.error
    throw error
  }
  return data as T
}

async function assertBarbaraAccess(user: AureonUser) {
  if (!isBarbaraEmail(user.email)) {
    clearTokens()
    throw new Error('unauthorized_user')
  }
  const access = await request<{ access?: { allowed?: boolean } }>(`/projects/${PROJECT_SLUG}/access`)
  if (!access?.access?.allowed) {
    clearTokens()
    throw new Error('project_access_denied')
  }
  return user
}

export const aureon = {
  auth: {
    async login(email: string, password: string) {
      const data = await request<{ user: AureonUser; access_token: string; refresh_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        retry: false,
      })
      persistTokens(data)
      await assertBarbaraAccess(data.user)
      return data.user
    },
    async restore() {
      if (!accessToken && !refreshToken) return null
      try {
        const user = await request<AureonUser>('/me')
        return await assertBarbaraAccess(user)
      } catch {
        clearTokens()
        return null
      }
    },
    async logout() {
      try {
        if (accessToken) {
          await request<void>('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
            retry: false,
          })
        }
      } finally {
        clearTokens()
      }
    },
    async requestPasswordReset(email: string) {
      await request<{ ok: true }>('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        retry: false,
      })
    },
    async resetPassword(email: string, token: string, newPassword: string) {
      await request<void>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: token.trim(), new_password: newPassword }),
        retry: false,
      })
      clearTokens()
    },
    isAuthenticated() {
      return Boolean(accessToken || refreshToken)
    },
  },
  data: {
    async list<T extends Record<string, unknown>>(collection: string, limit = 500) {
      const rows = await request<AureonRecord<T>[]>(`/v1/projects/${PROJECT_SLUG}/data/${encodeURIComponent(collection)}?environment=production&limit=${limit}`)
      return rows.map(flattenRecord)
    },
    async create<T extends Record<string, unknown>>(collection: string, data: T) {
      const row = await request<AureonRecord<T>>(`/v1/projects/${PROJECT_SLUG}/data/${encodeURIComponent(collection)}`, {
        method: 'POST',
        body: JSON.stringify({ environment: 'production', data }),
      })
      return flattenRecord(row)
    },
    async update<T extends Record<string, unknown>>(collection: string, id: string, data: T) {
      const row = await request<AureonRecord<T>>(`/v1/projects/${PROJECT_SLUG}/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify({ environment: 'production', data }),
      })
      return flattenRecord(row)
    },
    async remove(collection: string, id: string) {
      await request<void>(`/v1/projects/${PROJECT_SLUG}/data/${encodeURIComponent(collection)}/${encodeURIComponent(id)}?environment=production`, {
        method: 'DELETE',
      })
    },
    async upsertByField<T extends Record<string, unknown>>(collection: string, field: string, value: unknown, data: T) {
      const rows = await this.list<Record<string, unknown>>(collection)
      const found = rows.find((row) => row[field] === value)
      if (found) return this.update(collection, String(found.id), data)
      return this.create(collection, data)
    },
  },
}
