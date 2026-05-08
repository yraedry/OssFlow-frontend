import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { getYouTubeEmbedId } from '@/shared/utils/youtube'

interface YouTubeEmbedProps {
  url: string
  title: string
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const [show, setShow] = useState(false)
  const embedId = getYouTubeEmbedId(url)

  if (!embedId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Video
      </a>
    )
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setShow(prev => !prev)}
        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
      >
        {show ? '✕ Cerrar' : '▶ Video'}
      </button>
      {show && (
        <div className="mt-3 relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded"
            src={`https://www.youtube-nocookie.com/embed/${embedId}?rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  )
}
