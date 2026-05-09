export function getYouTubeEmbedId(url: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    // youtube.com/watch?v=ID
    if ((u.hostname === 'youtube.com' || u.hostname === 'www.youtube.com') && u.pathname === '/watch') {
      return u.searchParams.get('v')
    }
    // youtube.com/shorts/ID
    if ((u.hostname === 'youtube.com' || u.hostname === 'www.youtube.com') && u.pathname.startsWith('/shorts/')) {
      return u.pathname.split('/shorts/')[1].split('/')[0] || null
    }
    // youtube.com/embed/ID o youtube-nocookie.com/embed/ID
    if (u.pathname.startsWith('/embed/')) {
      return u.pathname.split('/embed/')[1].split('/')[0] || null
    }
    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null
    }
  } catch {
    // URL inválida — intentar con regex como fallback
    const m = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([^?&#/]{11})/)
    return m?.[1] ?? null
  }
  return null
}

export function getYouTubeWatchUrl(url: string): string | null {
  const id = getYouTubeEmbedId(url)
  return id ? `https://www.youtube.com/watch?v=${id}` : null
}

export function getYouTubeThumbnail(url: string, quality: 'mq' | 'hq' | 'sd' = 'mq'): string | null {
  const id = getYouTubeEmbedId(url)
  return id ? `https://img.youtube.com/vi/${id}/${quality}default.jpg` : null
}
