import { useState } from 'react'
import JournalForm from './components/JournalForm'
import Timeline from './components/Timeline'

const TABS = { NEW: 'new', TIMELINE: 'timeline' }

export default function App() {
  const [tab, setTab] = useState(TABS.NEW)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleCreated() {
    setRefreshKey((k) => k + 1)
    setTab(TABS.TIMELINE)
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">여행 저널</h1>
        <p className="text-sm text-gray-500">글을 쓰면 AI가 키워드를 뽑고 어울리는 사진을 추천해줘요</p>
      </header>

      <nav className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab(TABS.NEW)}
          className={`px-4 py-2 text-sm font-medium ${
            tab === TABS.NEW ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500'
          }`}
        >
          새 기록 작성
        </button>
        <button
          type="button"
          onClick={() => setTab(TABS.TIMELINE)}
          className={`px-4 py-2 text-sm font-medium ${
            tab === TABS.TIMELINE ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500'
          }`}
        >
          타임라인
        </button>
      </nav>

      {tab === TABS.NEW && <JournalForm onCreated={handleCreated} />}
      {tab === TABS.TIMELINE && <Timeline refreshKey={refreshKey} />}
    </div>
  )
}
