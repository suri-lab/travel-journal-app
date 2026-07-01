export default function JournalCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {item.thumb_url && (
        <div
          className="relative aspect-video w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${item.thumb_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <p className="line-clamp-3 text-sm text-gray-700">{item.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          {item.travel_date && <span>{item.travel_date}</span>}
          {item.location && <span className="rounded-full bg-gray-100 px-2 py-0.5">{item.location}</span>}
        </div>
      </div>
    </button>
  )
}
