const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// DEBUG: Log API URL khi build
console.log('[QuickFood API] NEXT_PUBLIC_API_URL:', API_URL)
console.log('[QuickFood API] Build env NODE_ENV:', process.env.NODE_ENV)

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('qf_token')
}

interface FetchOptions extends RequestInit {
  auth?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {}),
  }

  if (auth) {
    const token = getToken()
    if (token) {
      (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: finalHeaders,
    ...rest,
  })

  if (response.status === 401) {
    // Clear auth và redirect login
    localStorage.removeItem('qf_token')
    localStorage.removeItem('qf_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null as T

  return response.json()
}
