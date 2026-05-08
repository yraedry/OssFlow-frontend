import { PlayCircle } from 'lucide-react'
import { getYouTubeEmbedId } from '@/shared/utils/youtube'

interface YouTubeEmbedProps {
  url: string
  title: string
}

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const embedId = getYouTubeEmbedId(url)
  const href = embedId
    ? `https://www.youtube.com/watch?v=${embedId}`
    : url

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
      title={title}
    >
      <PlayCircle className="h-3.5 w-3.5" />
      Ver vídeo
    </a>
  )
}
