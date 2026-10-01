/**
 * Centralized API client.
 * All requests go to /api (proxied to http://localhost:3000 by Vite).
 */

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.details = data?.details || []
    throw err
  }

  return data
}

export const api = {
  /** GET /api/tickets?search=&status=&priority=&sort=&page=&limit= */
  listTickets(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString()
    return request(`/tickets${qs ? `?${qs}` : ''}`)
  },

  /** GET /api/tickets/summary */
  getSummary() {
    return request('/tickets/summary')
  },

  /** GET /api/tickets/:id */
  getTicket(id) {
    return request(`/tickets/${id}`)
  },

  /** POST /api/tickets */
  createTicket(payload) {
    return request('/tickets', { method: 'POST', body: JSON.stringify(payload) })
  },

  /** PATCH /api/tickets/:id */
  updateTicket(id, payload) {
    return request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
}
