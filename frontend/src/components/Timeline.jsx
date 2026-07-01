import { useEffect, useState } from 'react'
import { getTimeline } from '../api/client'
import JournalCard from './JournalCard'
import JournalDetailModal from './JournalDetailModal'

function groupByMonth(items) {
  const groups = []
  let currentKey = null
  for (const item of items) {
    const key = item.travel_date ? item.travel_date.slice(0, 7) : '날짜 미상'
    if (key !== currentKey) {
      groups.push({ key, items: [] })
      currentKey = key
    }
    groups[groups.length - 1].items.push(item)
  }
  return groups
}

export default function Timeline({ refreshKey }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    setLoading(true)
    getTimeline({ sort: 'desc', page: 1, size: 50 })
      .then((res) => setItems(res.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <p className="text-sm text-gray-500">타임라인을 불러오는 중…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!items.length) return <p className="text-sm text-gray-500">아직 저장된 여행 기록이 없습니다.</p>

  const groups = groupByMonth(items)

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.key} className="flex gap-4">
          <div className="w-16 shrink-0 pt-1 text-right text-xs font-medium text-gray-400">
            {group.key}
          </div>
          <div className="flex-1 space-y-4 border-l border-gray-200 pl-4">
            {group.items.map((item) => (
              <JournalCard
                key={item.journal_id}
                item={item}
                onClick={() => setSelectedId(item.journal_id)}
              />
            ))}
          </div>
        </div>
      ))}
      {selectedId && (
        <JournalDetailModal journalId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
