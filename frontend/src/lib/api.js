const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function startAnalysis(data) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Failed to start analysis')
  }
  return res.json()
}

export async function getReport(sessionId) {
  const res = await fetch(`${API_BASE}/report/${sessionId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch report' }))
    throw new Error(err.detail || 'Failed to fetch report')
  }
  return res.json()
}

export async function sendChatMessage(data) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Chat failed' }))
    throw new Error(err.detail || 'Chat request failed')
  }
  return res.json()
}

export async function sendToDiscord(data) {
  const res = await fetch(`${API_BASE}/discord`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Discord failed' }))
    throw new Error(err.detail || 'Discord request failed')
  }
  return res.json()
}

export async function downloadReportPdf(sessionId) {
  const res = await fetch(`${API_BASE}/download/${sessionId}`)
  if (!res.ok) throw new Error('Download failed')

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Intellex_Report_${sessionId.slice(0,8)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
