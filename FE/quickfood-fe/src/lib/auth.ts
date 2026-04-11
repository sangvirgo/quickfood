export interface UserInfo {
  id: number
  email: string
  role: 'CUSTOMER' | 'STAFF' | 'SHIPPER'
  name?: string
}

export function getUser(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('qf_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('qf_token')
}

export function saveAuth(token: string, user: UserInfo): void {
  localStorage.setItem('qf_token', token)
  localStorage.setItem('qf_user', JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem('qf_token')
  localStorage.removeItem('qf_user')
  localStorage.removeItem('qf_current_shipment')
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case 'STAFF':   return '/staff/dashboard'
    case 'SHIPPER': return '/shipper/dashboard'
    default:        return '/'
  }
}
