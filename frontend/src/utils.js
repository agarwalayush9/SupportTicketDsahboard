/**
 * Shared formatting / display utilities.
 */

export const PRIORITIES = ['Low', 'Medium', 'High']
export const STATUSES   = ['Open', 'In Progress', 'Resolved']

export function priorityClass(priority) {
  return { Low: 'low', Medium: 'medium', High: 'high' }[priority] || 'medium'
}

export function statusClass(status) {
  return { Open: 'open', 'In Progress': 'inprogress', Resolved: 'resolved' }[status] || 'open'
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeDate(iso) {
  if (!iso) return '—'
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days  = Math.floor(hours / 24)
  if (days < 30)  return `${days}d ago`
  return formatDate(iso)
}
