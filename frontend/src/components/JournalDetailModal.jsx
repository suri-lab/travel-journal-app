import { useEffect, useState } from 'react'
import { getJournalDetail } from '../api/client'

export default function JournalDetailModal({ journalId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getJournalDetail(journalId)
      .then(setDetail)
      .catch((err) => setError(err.message))
  }, [journalId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {error && <p className="p-6 text-sm text-red-600">{error}</p>}
        {!error && !detail && <p className="p-6 text-sm text-gray-500">불러오는 중…</p>}
        {detail && (
          <>
            {detail.photo && (
              <div className="relative">
                <img
                  src={detail.photo.full_url}
                  alt={`Photo by ${detail.photo.photographer}`}
                  className="max-h-96 w-full object-cover"
                />
                <a
                  href={detail.photo.photographer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
                >
                  Photo by {detail.photo.photographer} on Unsplash
                </a>
              </div>
            )}
            <div className="p-6">
              <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                {detail.travel_date && <span>{detail.travel_date}</span>}
                {detail.location && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5">{detail.location}</span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{detail.text}</p>
              {detail.keywords.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.keywords.map((kw) => (
                    <span key={kw} className="rounded-full bg-sky-50 px-2 py-1 text-xs text-sky-700">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/80 px-2 py-1 text-sm text-gray-600"
        >
          닫기
        </button>
      </div>
    </div>
  )
}
