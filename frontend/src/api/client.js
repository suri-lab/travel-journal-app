const BASE = `${import.meta.env.VITE_API_BASE_URL || ''}/api`

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `요청 실패 (${res.status})`)
  }
  return res.json()
}

export function extractKeywords(text) {
  return request('/journal/extract-keywords', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function searchPhotos(keywords, perPage = 9) {
  const params = new URLSearchParams({ keywords: keywords.join(','), per_page: perPage })
  return request(`/photos/search?${params.toString()}`)
}

export function createJournal(payload) {
  return request('/journal/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTimeline({ sort = 'desc', page = 1, size = 20 } = {}) {
  const params = new URLSearchParams({ sort, page, size })
  return request(`/journal/timeline?${params.toString()}`)
}

export function getJournalDetail(journalId) {
  return request(`/journal/${journalId}`)
}
