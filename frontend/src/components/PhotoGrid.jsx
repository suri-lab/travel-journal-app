export default function PhotoGrid({ photos, selectedId, onSelect }) {
  if (!photos.length) {
    return <p className="text-sm text-gray-500">추천 사진이 없습니다. 검색어를 조정해보세요.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => onSelect(photo)}
          className={`group relative aspect-square overflow-hidden rounded-lg border-2 ${
            selectedId === photo.id ? 'border-sky-600' : 'border-transparent'
          }`}
        >
          <img
            src={photo.thumb_url}
            alt={`Photo by ${photo.photographer}`}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {photo.photographer}
          </span>
        </button>
      ))}
    </div>
  )
}
