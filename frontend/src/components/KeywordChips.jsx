export default function KeywordChips({ keywords, selected, onToggle }) {
  if (!keywords.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => {
        const active = selected.includes(kw)
        return (
          <button
            key={kw}
            type="button"
            onClick={() => onToggle(kw)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              active
                ? 'border-sky-600 bg-sky-600 text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:border-sky-400'
            }`}
          >
            {kw}
          </button>
        )
      })}
    </div>
  )
}
