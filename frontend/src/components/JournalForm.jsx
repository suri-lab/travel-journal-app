import { useState } from 'react'
import { createJournal, extractKeywords, searchPhotos } from '../api/client'
import KeywordChips from './KeywordChips'
import PhotoGrid from './PhotoGrid'

const STEPS = { WRITE: 'write', PHOTO: 'photo', DETAILS: 'details' }

export default function JournalForm({ onCreated }) {
  const [step, setStep] = useState(STEPS.WRITE)
  const [text, setText] = useState('')
  const [keywords, setKeywords] = useState([])
  const [selectedKeywords, setSelectedKeywords] = useState([])
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [manualQuery, setManualQuery] = useState('')
  const [location, setLocation] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExtract() {
    setError('')
    setLoading(true)
    try {
      const result = await extractKeywords(text)
      setKeywords(result.keywords)
      setSelectedKeywords(result.keywords)
      setLocation(result.category_tags.place || '')
      const photoRes = await searchPhotos(result.keywords)
      setPhotos(photoRes.results)
      setStep(STEPS.PHOTO)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function runSearch(kws) {
    if (!kws.length) return
    setError('')
    setLoading(true)
    try {
      const photoRes = await searchPhotos(kws)
      setPhotos(photoRes.results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleKeyword(kw) {
    const next = selectedKeywords.includes(kw)
      ? selectedKeywords.filter((k) => k !== kw)
      : [...selectedKeywords, kw]
    setSelectedKeywords(next)
    runSearch(next)
  }

  function handleManualSearch() {
    const kws = manualQuery
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (kws.length) runSearch(kws)
  }

  async function handleSave() {
    if (!selectedPhoto) {
      setError('사진을 선택해주세요')
      return
    }
    setError('')
    setLoading(true)
    try {
      await createJournal({
        text,
        keywords: selectedKeywords,
        selected_photo: selectedPhoto,
        travel_date: travelDate || null,
        location: location || null,
      })
      setText('')
      setKeywords([])
      setSelectedKeywords([])
      setPhotos([])
      setSelectedPhoto(null)
      setLocation('')
      setTravelDate('')
      setStep(STEPS.WRITE)
      onCreated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {step === STEPS.WRITE && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">여행 글 (200~1000자)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-sky-500 focus:outline-none"
            placeholder="제주 애월 바닷가에서 노을을 보며 걸었다…"
          />
          <button
            type="button"
            onClick={handleExtract}
            disabled={loading || !text.trim()}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? '키워드 추출 중…' : '키워드 추출 & 사진 찾기'}
          </button>
        </div>
      )}

      {step === STEPS.PHOTO && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">추출된 키워드 (클릭해서 켜고 끄기)</p>
            <KeywordChips keywords={keywords} selected={selectedKeywords} onToggle={toggleKeyword} />
          </div>

          <div className="flex gap-2">
            <input
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="직접 검색어 입력 (쉼표로 구분)"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleManualSearch}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600"
            >
              검색
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">사진 검색 중…</p>
          ) : (
            <PhotoGrid photos={photos} selectedId={selectedPhoto?.id} onSelect={setSelectedPhoto} />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(STEPS.WRITE)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600"
            >
              뒤로
            </button>
            <button
              type="button"
              onClick={() => setStep(STEPS.DETAILS)}
              disabled={!selectedPhoto}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === STEPS.DETAILS && (
        <div className="space-y-4">
          {selectedPhoto && (
            <img
              src={selectedPhoto.thumb_url}
              alt="선택된 사진"
              className="h-40 w-full rounded-lg object-cover"
            />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">여행지</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">여행 날짜</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(STEPS.PHOTO)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600"
            >
              뒤로
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? '저장 중…' : '여행일지 카드 저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
