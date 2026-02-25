import { supabase } from '@/lib/supabase'
import { API_BASE_URL } from '@/constants/config'
import { ApiError } from './types/api.types'

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    if (response.status === 401) {
      const { useAuthStore } = await import('@/stores/auth.store')
      await useAuthStore.getState().signOut()
    }

    const errorBody = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiError(
      (errorBody as { error?: string }).error ?? 'Request failed',
      response.status,
    )
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path)
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body)
  },

  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PUT', path, body)
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PATCH', path, body)
  },

  delete<T>(path: string): Promise<T> {
    return request<T>('DELETE', path)
  },
}
