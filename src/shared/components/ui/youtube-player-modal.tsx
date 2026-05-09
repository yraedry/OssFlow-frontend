import { useState } from 'react'
import { Play } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog'
import { getYouTubeEmbedId, getYouTubeThumbnail } from '@/shared/utils/youtube'

interface YouTubePlayerModalProps {
  url: string
  title?: string
  compact?: boolean
}

export function YouTubePlayerModal({ url, title = 'Vídeo', compact = false }: YouTubePlayerModalProps) {
  const [open, setOpen] = useState(false)
  const embedId = getYouTubeEmbedId(url)

  if (!embedId) return null

  const thumbnail = getYouTubeThumbnail(url, 'hq')

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative cursor-pointer overflow-hidden border border-border group ${
          compact
            ? 'w-full max-w-xs aspect-video'
            : 'w-full aspect-video'
        }`}
        aria-label={`Reproducir vídeo: ${title}`}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-black/60 group-hover:bg-black/80 border border-white/20 transition-colors duration-200">
            <Play className="h-6 w-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 border-border overflow-hidden bg-black">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {open && (
            <div className="aspect-video w-full">
              <iframe
                key={embedId}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                title={title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
